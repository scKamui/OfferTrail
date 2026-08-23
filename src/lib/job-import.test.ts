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
      jobDescription: "Help us understand our customers.",
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
