import React from "react";
import { Button } from "reactstrap";
import FileSaver from "file-saver";
import { getCSV } from "../../utils/csv";
import Download from "../../assets/images/download.svg";
import "./styles.scss";
export const CSVExporter = ({ data, name }) => {
  const downloadFile = () => {
    const csv = getCSV(data);
    const csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    FileSaver.saveAs(csvBlob, name);
  };
  return (
    data.length > 0 && (
      <Button
        color="transparent"
        className="edit-button mx-auto"
        id="csv-download-btn"
        onClick={downloadFile}
      >
        <img src={Download} alt="Download Results as CSV"></img>
      </Button>
    )
  );
};
