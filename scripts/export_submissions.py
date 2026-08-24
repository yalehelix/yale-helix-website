#!/usr/bin/env python3
"""
Export Yale Helix startup applications into combined PDF reports.

For every submission in Supabase that hasn't been exported yet, this builds a
clean, branded PDF of the application answers and appends the startup's slide
deck. Re-run it whenever you like; already-exported submissions are skipped, so
each run only produces the new ones.

ONE-TIME SETUP
    cd scripts
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    python -m playwright install chromium

RUN
    python export_submissions.py            # export only new submissions
    python export_submissions.py --force    # re-export everything

Credentials are read from ../.env.local:
    NEXT_PUBLIC_SUPABASE_URL   (or SUPABASE_URL)
    SUPABASE_SERVICE_ROLE_KEY

Output PDFs are written to ../submissions/ (gitignored).
"""

from __future__ import annotations

import io
import re
import sys
from datetime import datetime
from pathlib import Path

import requests
from dotenv import dotenv_values
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pypdf import PdfReader, PdfWriter
from playwright.sync_api import sync_playwright

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
OUT_DIR = ROOT / "submissions"

BUCKET = "startup-decks"
TABLE = "startup_applications"

env = {**dotenv_values(ROOT / ".env.local")}
SUPABASE_URL = (env.get("NEXT_PUBLIC_SUPABASE_URL") or env.get("SUPABASE_URL") or "").rstrip("/")
SERVICE_KEY = env.get("SUPABASE_SERVICE_ROLE_KEY") or ""

if not SUPABASE_URL or not SERVICE_KEY:
    sys.exit(
        "Missing credentials. Set NEXT_PUBLIC_SUPABASE_URL and "
        "SUPABASE_SERVICE_ROLE_KEY in .env.local."
    )

AUTH = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"}


def fetch_rows():
    url = f"{SUPABASE_URL}/rest/v1/{TABLE}?select=*&order=created_at.asc"
    r = requests.get(url, headers=AUTH, timeout=60)
    r.raise_for_status()
    return r.json()


def download_deck(path: str) -> bytes:
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{path}"
    r = requests.get(url, headers=AUTH, timeout=120)
    r.raise_for_status()
    return r.content


def human_date(iso: str) -> str:
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone()
        return dt.strftime("%B %-d, %Y at %-I:%M %p")
    except Exception:
        return iso or ""


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (text or "startup").lower()).strip("-") or "startup"


def build_sections(row: dict):
    skills = row.get("skill_sets") or []
    skills_str = ", ".join(skills)
    other = (row.get("skill_sets_other") or "").strip()
    if other:
        skills_str = f"{skills_str}; Other: {other}" if skills_str else f"Other: {other}"

    return [
        (
            "Startup information",
            [
                ("One-sentence description", row.get("startup_description")),
                ("Primary problem", row.get("primary_problem")),
                ("Solution and what is unique", row.get("solution")),
                ("Current stage", row.get("current_stage")),
                ("Target customers", row.get("target_customers")),
                ("Business model", row.get("business_model")),
            ],
        ),
        ("Team", [("Team members", row.get("team"))]),
        (
            "Progress and goals",
            [
                ("Milestones achieved", row.get("milestone_achievements")),
                ("6-12 month goals and how Helix can help", row.get("twelve_month_goals")),
            ],
        ),
        (
            "Mentorship",
            [
                ("Why mentor Yale students through Helix", row.get("mentor_why")),
                ("What makes the team effective mentors", row.get("mentor_qualities")),
                ("Student contribution and professional development", row.get("student_development")),
            ],
        ),
        (
            "Students",
            [
                ("Fellows the startup can support", row.get("fellow_count")),
                ("Most valuable skill sets", skills_str),
                ("Example projects or tasks", row.get("example_projects")),
                ("Desired skills, coursework, or experience", row.get("desired_skills")),
                ("Expected student involvement", row.get("involvement_level")),
            ],
        ),
        (
            "Additional information",
            [
                ("Other incubators or accelerators", row.get("other_accelerators")),
                ("Anything else", row.get("additional_info")),
            ],
        ),
    ]


def render_info_pdf(jinja_env, browser, row: dict) -> bytes:
    app = {**row, "submitted_human": human_date(row.get("created_at", ""))}
    html = jinja_env.get_template("report_template.html").render(
        app=app,
        sections=build_sections(row),
        generated_at=datetime.now().strftime("%B %-d, %Y"),
    )
    page = browser.new_page()
    page.set_content(html, wait_until="networkidle")  # let web fonts load
    pdf = page.pdf(format="Letter", print_background=True)
    page.close()
    return pdf


def merge(info_pdf: bytes, deck_pdf: bytes | None, out_path: Path):
    writer = PdfWriter()
    for p in PdfReader(io.BytesIO(info_pdf)).pages:
        writer.add_page(p)
    if deck_pdf:
        try:
            for p in PdfReader(io.BytesIO(deck_pdf)).pages:
                writer.add_page(p)
        except Exception as e:
            print(f"    ! could not read deck PDF ({e}); writing application pages only")
    with open(out_path, "wb") as f:
        writer.write(f)


def main():
    force = "--force" in sys.argv
    OUT_DIR.mkdir(exist_ok=True)
    existing = [p.name for p in OUT_DIR.glob("*.pdf")]

    rows = fetch_rows()
    print(f"Found {len(rows)} submission(s) in Supabase.")

    jinja_env = Environment(
        loader=FileSystemLoader(str(SCRIPT_DIR)),
        autoescape=select_autoescape(["html"]),
    )

    new_count = 0
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        try:
            for row in rows:
                rid = row["id"]
                if not force and any(rid in name for name in existing):
                    continue

                name = f"{row.get('created_at', '')[:10]}_{slugify(row.get('startup_name'))}_{rid}.pdf"
                out_path = OUT_DIR / name
                print(f"  + {row.get('startup_name')}  ->  submissions/{name}")

                deck_pdf = None
                deck_path = row.get("deck_path")
                if deck_path:
                    try:
                        deck_pdf = download_deck(deck_path)
                    except Exception as e:
                        print(f"    ! could not download deck ({e}); application pages only")

                info_pdf = render_info_pdf(jinja_env, browser, row)
                merge(info_pdf, deck_pdf, out_path)
                new_count += 1
        finally:
            browser.close()

    if new_count == 0:
        print("Nothing new to export. You are up to date.")
    else:
        print(f"Done. Exported {new_count} new submission(s) to {OUT_DIR}/")


if __name__ == "__main__":
    main()
