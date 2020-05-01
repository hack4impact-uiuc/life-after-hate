/* eslint-disable no-unused-vars */
// run `node utils/volunteer-sheet-parser.js <insert_spreadsheet_path>` from the `/backend` folder

const XLSX = require("xlsx");
const extractor = require("keyword-extractor");
const resourceUtils = require("./resource-utils");
const IndividualResource = require("../models/IndividualResource");
const mongoose = require("mongoose");

mongoose.connect(process.env.DB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

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
    console.log(mailingAddress);
    console.log(err);
    throw "Bad address";
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

  const workbook = XLSX.readFile(spreadsheet);
  const json = XLSX.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]],
    { defval: "", raw: false }
  );
  try {
    const mongoData = await Promise.all(json.map(convertSchema));
    const resources = mongoData.map(
      (resource) => new IndividualResource(resource)
    );
    await Promise.all(resources.map((r) => r.save()));
  } catch (err) {
    console.log(err);
  } finally {
    mongoose.connection.close();
  }
};

main();
