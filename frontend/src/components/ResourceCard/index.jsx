import React, { Component } from "react";
// import { Card, CardText, CardBody, CardTitle } from "reactstrap";
import "./styles.scss";

class ResourceCard extends Component {
  render() {
    return (
      <div>
        <div className="resourceCard">
          {this.props.title}
          {this.props.text}
        </div>
      </div>
    );
  }
}

export default ResourceCard;
