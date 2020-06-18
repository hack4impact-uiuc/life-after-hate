import React from "react";
import { Button } from "reactstrap";
import FileSaver from "file-saver";
import { getCSV } from "../../utils/csv";
import Download from "../../assets/images/download.svg";
import "./styles.scss";
export const CSVExporter = ({ data, name = "resources.csv" }) => {
  const downloadFile = () => {
    const csv = getCSV(data);
    const csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    FileSaver.saveAs(csvBlob, name);
  };
  return (
    data.length > 0 && (
      <div className="text-center">
        <Button
          color="transparent"
          className="mx-auto"
          id="csv-download-btn"
          onClick={downloadFile}
        >
          <img src={Download} alt="Download Results as CSV"></img>
        </Button>
        <h3 className="d-none d-md-inline pl-2">Download CSV</h3>
      </div>
    )
  );
};
