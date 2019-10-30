import React, { Component } from "react";
import { Card, CardText, CardBody, CardTitle } from "reactstrap";
import "./styles.scss";

class ResourceCard extends Component {
  render() {
    return (
      <div>
        <Card className="resourceCard">
          <CardBody>
            <CardTitle>{this.props.title}</CardTitle>
            <CardText>{this.props.text}</CardText>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default ResourceCard;
