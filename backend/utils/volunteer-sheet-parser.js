// run `node utils/volunteer-sheet-parser.js <insert_spreadsheet_path>` from the `/backend` folder

const XLSX = require('xlsx')
const extractor = require("keyword-extractor");
const resourceUtils = require("./resource-utils");
const Resource = require("../models/Resource");
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
})

const formatNotes = ({"Form Received": formReceived, 
                      "Availability": availability, 
                      "How did you hear about LAH?": refer, 
                      "Volunteer Roles": roles}) => (
  "Form Received: " + formReceived + "\n\n" +
  "Availability: " + availability + "\n\n" +
  "How they heard about LAH: " + refer + "\n\n" +
  "Volunteer Roles: " + roles + "\n\n"
)

const createTags = ({"18 or Older?": eighteen, 
                     "Skills, Qualifications, Current Occupation": skills, 
                     "Do you have a degree in the mental health field?": mentalHealth, 
                     "Volunteer Roles": roles,
                     "Willing to travel?": travel}) => [
  eighteen === "Yes" ? "18+" : null,
  mentalHealth === "Yes" ? "Mental Health" : null,
  travel === "Yes" ? "Able to travel" : null,
  ...extractor.extract(skills + " " + roles, {
    language: "english",
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: true
  })
]

const getLocation = async address => {
  try {
    const { lat, lng } = await resourceUtils.addressToLatLong(address);
    return [lng, lat]
  } catch(err) {
    return [null, null]
  }
}

const convertSchema = async entry => ({
  companyName: "a",
  contactName: entry["First Name"] + " " + entry["Last Name"],
  contactPhone: "a",
  contactEmail: entry["Email Address"] || "a",
  description: entry["Skills, Qualifications, Current Occupation"] || "a",
  address: entry["Mailing Address"] || "a",
  location: {
    coordinates: await getLocation(entry["Mailing Address"])
  },
  federalRegion: 1,
  notes: formatNotes(entry),
  tags: createTags(entry).filter(tag => tag !== null)
})

const main = async () => {
  const spreadsheet = process.argv[2]

  const workbook = XLSX.readFile(spreadsheet)
  const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {defval: "", raw: false})
  const mongoData = await Promise.all(json.map(convertSchema))
  await Resource.collection.insert(mongoData)
}

main()
