import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "reactstrap";
import FileSaver from "file-saver";
import { getCSV } from "../../utils/csv";
import Download from "../../assets/images/download.svg";
import "./styles.scss";
export const CSVExporter = ({ data, name = "resources.csv" }) => {
  const [message, setMessage] = useState("");
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const downloadFile = () => {
    clearTimeout(timer.current);
    try {
      const csv = getCSV(data);
      const csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      FileSaver.saveAs(csvBlob, name);
      setMessage("Download started");
    } catch {
      setMessage("Export failed. Try again.");
    }
    timer.current = setTimeout(() => setMessage(""), 4000);
  };
  return (
    data.length > 0 && (
      <div className="csv-export text-center">
        <Button
          color="transparent"
          className="mx-auto"
          id="csv-download-btn"
          onClick={downloadFile}
        >
          <img src={Download} alt="" />
          <span className="csv-export-label">
            <span className="csv-export-placeholder" aria-hidden="true">
              Download started
            </span>
            <span>
              {message === "Download started" ? message : "Export CSV"}
            </span>
          </span>
        </Button>
        <span
          className={
            message.startsWith("Export failed")
              ? "csv-export-error"
              : "csv-export-status"
          }
          role="status"
        >
          {message}
        </span>
      </div>
    )
  );
};

CSVExporter.propTypes = {
  data: PropTypes.array.isRequired,
  name: PropTypes.string,
};
