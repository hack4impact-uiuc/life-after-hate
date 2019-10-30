import React from "react";
import { Card, CardText, CardBody, CardTitle } from "reactstrap";
import "./styles.scss";

class ResourceCard extends React.Component {
  // constructor(props) {
  //   super(props);
  // }
  render() {
    return (
      <div>
        <Card className="resourceCard">
          <CardBody>
            <CardTitle>{this.props.title}</CardTitle>
            <CardText>{this.props.text}</CardText>
            {/* <Button>Description</Button> */}
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default ResourceCard;
