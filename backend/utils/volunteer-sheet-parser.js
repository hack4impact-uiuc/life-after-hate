/* eslint-disable no-unused-vars */
// run `node utils/volunteer-sheet-parser.js <insert_spreadsheet_path>` from the `/backend` folder

require("dotenv").config({ quiet: true });
const ExcelJS = require("exceljs");

const resourceUtils = require("./resource-utils");
const IndividualResource = require("../models/IndividualResource");
const mongoose = require("mongoose");

const createTags = ({
  "18 or Older?": eighteen,
  "Skills, Qualifications, Current Occupation": skills,
  "Do you have a degree in the mental health field?": mentalHealth,
  "Volunteer Roles": roles,
  "Willing to travel?": travel,
}) => [
  eighteen === "Yes" ? "18+" : null,
  mentalHealth === "Yes" ? "Mental Health Certified" : null,
  travel === "Yes" ? "Can Travel" : null,
  // ...extractor.extract(`${skills} ${roles}`, {
  //   language: "english",
  //   remove_digits: true,
  //   return_changed_case: true,
  //   remove_duplicates: true,
  // }),
];

const getLocation = async (mailingAddress) => {
  if (!mailingAddress) {
    return {
      location: {
        coordinates: [null, null],
      },
      federalRegion: -1,
    };
  }
  try {
    const { lat, lng, region, ...address } = await resourceUtils.geocodeAddress(
      mailingAddress
    );
    return {
      location: {
        coordinates: [lng, lat],
      },
      federalRegion: region,
      address,
    };
  } catch (err) {
    throw new Error("An address could not be geocoded");
  }
};

const formatDate = (date) => new Date(date);

const convertSchema = async (entry) => ({
  contactName: `${entry["First Name"]} ${entry["Last Name"]}`,
  dateCreated: formatDate(entry["Form Received"]),
  contactEmail: entry["Email Address"],
  skills: entry["Skills, Qualifications, Current Occupation"],
  availability: entry["Availability"],
  volunteerRoles: entry["Volunteer Roles"],
  volunteerReason: entry["Why would you like to volunteer with us?"],
  howDiscovered: entry["How did you hear about Life After Hate?"],
  notes: "",
  tags: createTags(entry).filter((tag) => tag !== null),
  ...(await getLocation(entry["Mailing Address"])),
});

const main = async () => {
  const spreadsheet = process.argv[2];

  await mongoose.connect(process.env.DB_URI, { serverSelectionTimeoutMS: 10000 });
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(spreadsheet);
    const sheet = workbook.worksheets[0];
    if (!sheet || sheet.rowCount > 10000) throw new Error("Invalid or oversized spreadsheet");
    const headers = sheet.getRow(1).values;
    const json = [];
    sheet.eachRow((row, number) => {
      if (number === 1) return;
      const entry = {};
      headers.forEach((header, index) => { if (header) entry[String(header)] = row.getCell(index).text; });
      json.push(entry);
    });
    // Bound geocoding concurrency and avoid transmitting an entire sheet at once.
    const mongoData = [];
    for (const entry of json) mongoData.push(await convertSchema(entry));
    const resources = mongoData.map(
      (resource) => new IndividualResource(resource)
    );
    await Promise.all(resources.map((r) => r.save()));
  } catch (err) {
    console.error("Import failed; no raw spreadsheet data is logged");
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

main().catch(() => { console.error("Import could not start"); process.exitCode = 1; });
