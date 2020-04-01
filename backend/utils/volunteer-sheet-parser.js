// run `node utils/volunteer-sheet-parser.js <insert_spreadsheet_path>` from the `/backend` folder

const XLSX = require("xlsx");
const extractor = require("keyword-extractor");
const resourceUtils = require("./resource-utils");
const Resource = require("../models/Resource");
const mongoose = require("mongoose");

mongoose.connect(process.env.DB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const formatNotes = ({
  "Form Received": formReceived,
  Availability: availability,
  "How did you hear about LAH?": refer,
  "Volunteer Roles": roles
}) =>
  `Form Received: ${formReceived}\n\n` +
  `Availability: ${availability}\n\n` +
  `How they heard about LAH: ${refer}\n\n` +
  `Volunteer Roles: ${roles}\n\n`;

const createTags = ({
  "18 or Older?": eighteen,
  "Skills, Qualifications, Current Occupation": skills,
  "Do you have a degree in the mental health field?": mentalHealth,
  "Volunteer Roles": roles,
  "Willing to travel?": travel
}) => [
  eighteen === "Yes" ? "18+" : null,
  mentalHealth === "Yes" ? "Mental Health" : null,
  travel === "Yes" ? "Able to travel" : null,
  ...extractor.extract(`${skills} ${roles}`, {
    language: "english",
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: true
  })
];

const getLocation = async mailingAddress => {
  try {
    const { lat, lng, region, ...address } = await resourceUtils.geocodeAddress(mailingAddress);
    return {
      location: {
        coordinates: [lng, lat]
      },
      federalRegion: region,
      address
    };
  } catch (err) {
    return {
      location: {
        coordinates: [null, null]
      },
      federalRegion: -1
    };
  }
};

const convertSchema = async entry => ({
  contactName: `${entry["First Name"]} ${entry["Last Name"]}`,
  contactEmail: entry["Email Address"],
  description: entry["Skills, Qualifications, Current Occupation"],
  notes: formatNotes(entry),
  tags: createTags(entry).filter(tag => tag !== null),
  ...(await getLocation(entry["Mailing Address"]))
});

const main = async () => {
  const spreadsheet = process.argv[2];

  const workbook = XLSX.readFile(spreadsheet);
  const json = XLSX.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]],
    { defval: "", raw: false }
  );
  const mongoData = await Promise.all(json.map(convertSchema));
  await Resource.collection.insert(mongoData);
};

main();
