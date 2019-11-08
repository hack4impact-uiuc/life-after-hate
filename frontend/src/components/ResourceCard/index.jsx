import React, { Component } from "react";
import "./styles.scss";

class ResourceCard extends Component {
  render() {
    return (
      <div>
        <div className="resourceCard">
          {this.props.name}
          <br />
          {this.props.description}
        </div>
      </div>
    );
  }
}

export default ResourceCard;
