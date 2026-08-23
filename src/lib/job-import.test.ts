import { describe, expect, it } from "vitest";
import { extractJobDetails } from "./job-import";

describe("extractJobDetails", () => {
  it("reads a complete JobPosting block", () => {
    const html = `
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": "Product Designer",
          "hiringOrganization": { "name": "Northstar Labs" },
          "jobLocationType": "TELECOMMUTE",
          "applicantLocationRequirements": { "name": "Canada" },
          "description": "<p>Design useful products with our team.</p>",
          "validThrough": "2026-09-30T23:59:00Z",
          "baseSalary": {
            "currency": "CAD",
            "value": { "minValue": 80000, "maxValue": 100000, "unitText": "YEAR" }
          }
        }
      </script>`;

    expect(extractJobDetails(html)).toEqual({
      company: "Northstar Labs",
      position: "Product Designer",
      location: "Canada",
      workMode: "remote",
      salaryRange: "CAD 80000–100000 per year",
      jobDescription: "Design useful products with our team.",
      applicationDeadline: "2026-09-30",
    });
  });

  it("finds a JobPosting inside an @graph", () => {
    const html = `
      <script type="application/ld+json">
        { "@graph": [
          { "@type": "Organization", "name": "Example" },
          {
            "@type": ["Thing", "JobPosting"],
            "title": "Backend Developer",
            "hiringOrganization": { "name": "Canopy Studio" },
            "jobLocation": { "address": {
              "addressLocality": "Vancouver",
              "addressRegion": "BC",
              "addressCountry": "Canada"
            }}
          }
        ]}
      </script>`;

    expect(extractJobDetails(html)).toMatchObject({
      company: "Canopy Studio",
      position: "Backend Developer",
      location: "Vancouver, BC, Canada",
      workMode: "onsite",
    });
  });

  it("uses conservative page fallbacks when JSON-LD is unavailable", () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="UX Researcher at Harbour Tech" />
          <meta name="description" content="Help us understand our customers." />
        </head>
        <body><h1>UX Researcher</h1></body>
      </html>`;

    expect(extractJobDetails(html)).toEqual({
      company: "Harbour Tech",
      position: "UX Researcher",
      location: undefined,
      workMode: undefined,
      salaryRange: undefined,
      jobDescription: "Help us understand our customers.",
    });
  });

  it("reads a Greenhouse page without confusing title details for the company", () => {
    const html = `
      <html>
        <head>
          <title>Job Application for Software Developer — iOS (Canada) at TextNow, Inc.</title>
          <meta property="og:title" content="Software Developer — iOS (Canada)" />
          <meta property="og:description" content="Waterloo, ON - Hybrid" />
        </head>
        <body>
          <div class="job__title"><h1>Software Developer — iOS (Canada)</h1></div>
          <div class="job__location">Waterloo, ON - Hybrid</div>
          <div class="job__description">
            <div class="posting-requirements">
              <p>Build and maintain high-performance iOS applications.</p>
            </div>
            <div data-qa="salary-range">
              Canada Intermediate: CAD $113,400 - $162,000 annually
              Canada Senior: CAD $158,000 – 207,000 annually
            </div>
          </div>
        </body>
      </html>`;

    expect(extractJobDetails(html)).toEqual({
      company: "TextNow, Inc.",
      position: "Software Developer — iOS (Canada)",
      location: "Waterloo, ON - Hybrid",
      workMode: "hybrid",
      salaryRange:
        "CAD $113,400 - $162,000 annually; CAD $158,000 – 207,000 annually",
      jobDescription: "Build and maintain high-performance iOS applications.",
    });
  });

  it("ignores broken JSON-LD and continues to the next block", () => {
    const html = `
      <script type="application/ld+json">{not valid json}</script>
      <script type="application/ld+json">
        { "@type": "JobPosting", "title": "Data Analyst", "hiringOrganization": { "name": "Acme" } }
      </script>`;

    expect(extractJobDetails(html)).toMatchObject({
      company: "Acme",
      position: "Data Analyst",
    });
  });
});
