import React from "react";
import { Card, CardText, CardBody, CardTitle, Button } from "reactstrap";
import "./../styles/resourceCard.scss";

class Search extends React.Component {
  //   constructor(props) {
  //     super(props);
  //   }
  render() {
    return (
      <div>
        <Card className="resourceCard">
          <CardBody>
            <CardTitle>McKinley Health Center</CardTitle>
            <CardText>This place gives you free drugs</CardText>
            <Button>Description</Button>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default Search;
