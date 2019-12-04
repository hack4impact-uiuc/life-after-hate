import React, { Component } from "react";
import "./styles.scss";

class ResourceCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardStyle: "collapsed"
    };
  }

  handleOnClick = () => {
    this.setState(prevstate => ({
      cardStyle: prevstate.cardStyle === "collapsed" ? "expanded" : "collapsed"
    }));
  };

  render() {
    return (
      <div
        role="button"
        tabIndex="0"
        className={this.state.cardStyle}
        onClick={this.handleOnClick}
        onKeyDown={this.handleOnClick}
      >
        <b>{this.props.name}</b>
        <br />
        {this.props.description}
      </div>
    );
  }
}

export default ResourceCard;
