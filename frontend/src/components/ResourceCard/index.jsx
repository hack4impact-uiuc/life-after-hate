import React, { Component } from "react";
import "./styles.scss";

class ResourceCard extends Component {
  render() {
    return (
      <div>
        <div className="resourceCard">
          {this.props.title}
          <br />
          {this.props.text}
        </div>
      </div>
    );
  }
}

export default ResourceCard;
