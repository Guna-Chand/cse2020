import React from "react";
import Fade from "react-reveal/Fade";

class CardList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cardStyle: "cardStyle" + this.props.type,
            thumb: "thumb" + this.props.type,
            cardInfo: "cardInfo" + this.props.type,
        };
    }

    render() {
        return (
            <div>
                <Fade bottom duration={300}>
                    <div className="sectionHeader">
                        <div className="row justify-content-center">
                            <div className="col-md-12 heading-section text-center">
                                <span className="subheading">
                                    {this.props.category}
                                </span>
                            </div>
                        </div>
                    </div>
                </Fade>
                <div className="card-list" id="card-list">
                    {this.props.data.map((item, index) => (
                        <Fade
                            bottom
                            duration={400}
                            key={index}
                            onReveal={() => this.props.getThumbImage(item.personId)}
                        >
                            <div className="cardStyleProtector">
                                <div
                                    className="cardStyle"
                                    id={this.state.cardStyle + item.personId}
                                >
                                    <div
                                        className="card-image-div card-image-div-temp"
                                        id={this.state.thumb + item.personId + "div"}
                                    >
                                        <img
                                            src="#"
                                            alt="NotLoaded"
                                            className="card-image"
                                            id={this.state.thumb + item.personId}
                                        />
                                    </div>
                                    <div
                                        className="card-info"
                                        id={this.state.cardInfo + item.personId}
                                    >
                                        <div className="card-info-name">
                                            {item.name}
                                        </div>
                                    </div>
                                    <div className="card-features">
                                        <div
                                            className="card-features-button"
                                            onClick={() =>
                                                this.props.viewDetails(item.personId)
                                            }
                                        >
                                            View Details
                                        </div>
                                    </div>
                                    <div
                                        className="cardStyleHighlight"
                                        id={
                                            this.state.cardStyle + item.personId + "Highlight"
                                        }
                                    ></div>
                                </div>
                            </div>
                        </Fade>
                    ))
                    }
                </div>
            </div>
        );
    }
}
export default CardList;
