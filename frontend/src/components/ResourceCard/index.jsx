import React, { Component } from "react";
import "./styles.scss";

class ResourceCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardStyle: "collapsed"
    };
  }

  handleOnClickCard = () => {
    this.setState({
      cardStyle: "expanded"
    });
  };

  handleOnClickButton = () => {
    this.setState({
      cardStyle: "collapsed"
    });
  };

  renderTags = tag => <div className="card-tag">{tag}</div>;

  render() {
    return (
      <div className="resource-card">
        <div className={this.state.cardStyle}>
          <div
            role="button"
            tabIndex="0"
            onClick={this.handleOnClickCard}
            onKeyPress=""
            className="card-wrap"
          >
            <div className="card-title">{this.props.name}</div>
            <div className="card-distance">
              {Math.round(this.props.distanceFromSearchLoc * 10) / 10} miles
              away
            </div>
            <div className="card-desc">{this.props.description}</div>

            <div className="card-details">
              <div className="detail-section">
                <p className="detail-title">Point of Contact</p>
                <p className="detail-content">{this.props.contactName}</p>
                <a
                  className="detail-content"
                  href={`mailto:${this.props.contactEmail}`}
                >
                  {this.props.contactEmail}
                </a>
                <p className="detail-content">
                  Phone: {this.props.contactPhone}
                </p>
              </div>

              <div className="detail-section">
                <p className="detail-title">Address</p>
                <p className="detail-content">{this.props.address}</p>
              </div>

              <div className="detail-section">
                <p className="detail-title">Notes</p>
                <p className="detail-content">{this.props.notes}</p>
              </div>
            </div>

            <div className="card-tags">
              {this.props.tags.map(this.renderTags)}
            </div>
          </div>
          <button
            tabIndex="0"
            className="card-close"
            onClick={this.handleOnClickButton}
          >
            Close
          </button>
        </div>
      </div>
    );
  }
}

export default ResourceCard;
