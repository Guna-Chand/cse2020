import React from "react";
import Fade from "react-reveal/Fade";
import CardList from "./CardList";
import Select from "react-select";
import { FiSearch } from "react-icons/fi";

const groupStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
};
const groupBadgeStyles = {
    backgroundColor: "#EBECF0",
    borderRadius: "2em",
    color: "#172B4D",
    display: "inline-block",
    fontSize: 12,
    fontWeight: "normal",
    lineHeight: "1",
    minWidth: 1,
    padding: "0.16666666666667em 0.5em",
    textAlign: "center",
};

const formatGroupLabel = (data) => (
    <div style={groupStyles}>
        <span>{data.label}</span>
        <span style={groupBadgeStyles}>{data.options.length}</span>
    </div>
);

class DataDisplay extends React.Component {
    constructor(props) {
        super(props);
        if (this.props.category === "all") {
            this.state = {
                categoryList: ["CSE 1", "CSE 2", "CSE 3", "STAFF"],
                overlay: "searchBarOverlayAll",
                searchBar: "searchBarAll",
                type: 1,
                placeholder: "Search for name or roll number..."
            };
        } else if (this.props.category === "cse1") {
            this.state = {
                categoryList: ["CSE 1"],
                overlay: "searchBarOverlayCSE1",
                searchBar: "searchBarCSE1",
                type: 2,
                placeholder: "Search for name or roll number..."
            };
        } else if (this.props.category === "cse2") {
            this.state = {
                categoryList: ["CSE 2"],
                overlay: "searchBarOverlayCSE2",
                searchBar: "searchBarCSE2",
                type: 2,
                placeholder: "Search for name or roll number..."
            };
        } else if (this.props.category === "cse3") {
            this.state = {
                categoryList: ["CSE 3"],
                overlay: "searchBarOverlayCSE3",
                searchBar: "searchBarCSE3",
                type: 2,
                placeholder: "Search for name or roll number..."
            };
        } else if (this.props.category === "staff") {
            this.state = {
                categoryList: ["STAFF"],
                overlay: "searchBarOverlayStaff",
                searchBar: "searchBarStaff",
                type: 2,
                placeholder: "Search for name..."
            };
        }
    }

    searchBarVisibilitySwap = (decoy, main) => {
        document.getElementById(decoy).style.opacity = 0;
        document.getElementById(main).style.visibility = "visible";
        setTimeout(() => {
            document.getElementById(main).style.marginTop = "10px";
            document.getElementById(decoy).style.visibility = "hidden";
            document.getElementById(main).style.opacity = 1;
        }, 500);
    };

    searchDealer = (e) => {
        try {
            if (e !== null) {
                let id = "#" + e.value;
                window.location = id;
                document
                    .getElementById(e.value + "Highlight")
                    .classList.toggle("HighlightBlinker");
                setTimeout(() => {
                    document
                        .getElementById(e.value + "Highlight")
                        .classList.toggle("HighlightBlinker");
                }, 1200);
            }
        } catch (err) {
            console.log(err);
        }
    };

    render() {
        return (
            <section className="ftco-section ftco-no-pb">
                <div className="searchBarCenter">
                    <Fade>
                        <div
                            className="searchBarOverlay max-widther"
                            id={this.state.overlay}
                        >
                            <span
                                className="searchIconSpan"
                                onClick={() =>
                                    this.searchBarVisibilitySwap(
                                        this.state.overlay,
                                        this.state.searchBar
                                    )
                                }
                            >
                                <FiSearch className="searchIcon" />
                            </span>
                        </div>
                    </Fade>
                    <div className="searchBarDiv" id={this.state.searchBar}>
                        <Select
                            className="searchBar"
                            options={this.props.dataOptions}
                            formatGroupLabel={formatGroupLabel}
                            isClearable
                            isSearchable
                            onChange={this.searchDealer}
                            placeholder={
                                <div>{this.state.placeholder}</div>
                            }
                        />
                    </div>
                </div>
                {this.props.data.map((dataItem, index) => (
                    <CardList 
                        key={index}
                        data={dataItem} 
                        getThumbImage={this.props.getThumbImage} 
                        type={this.state.type} 
                        viewDetails={this.props.viewDetails} 
                        category={this.state.categoryList[index]} 
                    />
                ))}
            </section>
        );
    }
}
export default DataDisplay;
