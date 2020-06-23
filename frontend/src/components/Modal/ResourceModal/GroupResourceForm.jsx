/* eslint-disable jsx-a11y/no-onchange */
import { createInput } from "./index";

const GroupResourceFields = [
  { labelText: "Contact Name", shortName: "contactName", required: true },
  { labelText: "Company Name", shortName: "companyName", required: true },
  { labelText: "Contact Phone", shortName: "contactPhone" },
  { labelText: "Contact Email", shortName: "contactEmail" },
  {
    labelText: "Description",
    shortName: "description",
    tag: "textarea",
    rows: 10,
  },
  { labelText: "Address", shortName: "address", required: true },
  { labelText: "Notes", shortName: "notes" },
];

const GroupResourceForm = (props) =>
  GroupResourceFields.map((field) => createInput({ ...field, ...props }));

export default GroupResourceForm;
