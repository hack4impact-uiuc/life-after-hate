/* eslint-disable jsx-a11y/no-onchange */
import { createInput } from "./index";

const TangibleResourceFields = [
  { labelText: "Contact Name", shortName: "contactName", required: true },
  { labelText: "Name of Resource", shortName: "resourceName", required: true },
  { labelText: "Contact Phone", shortName: "contactPhone" },
  { labelText: "Contact Email", shortName: "contactEmail" },
  {
    labelText: "Description",
    shortName: "description",
    tag: "textarea",
    rows: 10,
  },
  {
    labelText: "Resource Quantity",
    shortName: "quantity",
    tag: "input",
  },
  { labelText: "Address", shortName: "address", required: true },
  { labelText: "Notes", shortName: "notes" },
];

const TangibleResourceForm = (props) =>
  TangibleResourceFields.map((field) => createInput({ ...field, ...props }));
export default TangibleResourceForm;