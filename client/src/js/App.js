import React from "react";
import "../css/App.css";
import "../css/AppMobile.css";
import "../css/Timeline.css";
import "../css/Footer.css";
import Compress from "compress.js";
import { isMobile } from "react-device-detect";
import axios from "axios";
import Fade from "react-reveal/Fade";
import Select from "react-select";
import Zoom from "react-reveal/Zoom";
import { FaCode, FaGraduationCap, FaChevronDown } from "react-icons/fa";
import { FiSearch, FiInfo } from "react-icons/fi";
import { MdCancel, MdCall, MdEmail, MdHome } from "react-icons/md";
import { IoIosHeart } from "react-icons/io";
import linesBackground from "../images/lines.png";
import madeByImage from "../images/madeByImage.jpg";
import OtpInput from "react-otp-input";

const compress = new Compress();

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

const personImageDataGlobal = [];
const personDetailsDataGlobal = [];

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showTimeoutMsgTrigger: false,
      showAbout: false,
      authenticated: false,
      requestAdmin: false,
      isAdmin: "NotYet",
    };
  }

  componentDidMount() {
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    document.onkeydown = (event) => {
      let disabledKeys = ["Alt", "Option", "Command"];
      let allowedKeys = ["c", "C", "v", "V", "x", "X", "a", "A", "Control"];
      try {
        if (disabledKeys.includes(event.key) || event.altKey === true) {
          return false;
        } else if (event.ctrlKey === true) {
          if (allowedKeys.includes(event.key)) {
            return true;
          } else {
            return false;
          }
        } else if (event.key === "Escape") {
          if (
            document
              .getElementById("detailsModal")
              .classList.contains("showDetailsModal")
          ) {
            this.closeDetails();
          }
        } else {
          return true;
        }
      } catch (err) {
        console.log(err);
      }
    };

    axios
      .post("/initialFireup")
      .then((res) => {
        this.setState({ totalVisits: res.data[0].totalVisits });
      })
      .catch((err) => {
        console.error(err);
      });

    if (localStorage.getItem("x_info")) {
      this.authenticate(true, localStorage.getItem("x_info"));
    }
  }

  dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(","),
      mime = "image/jpeg",
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  hexToBase64(ArrayBuffer) {
    let TYPED_ARRAY = new Uint8Array(ArrayBuffer);
    let STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, "");
    return btoa(STRING_CHAR);
  }

  uploadNewData = (e) => {
    e.preventDefault();
    let category = document.getElementById("categoryInput").value;
    if (category === "select") {
      alert("Category must be selected!");
    } else {
      let croppedBase64 = document.getElementById("tempImg").src;
      if (croppedBase64.length < 50) {
        document.getElementById("fileSelectInput").value = "";
        document.getElementById("fileSelectLabel").innerHTML = "Choose file...";
        document.getElementById("tempImg").src = "";
        alert("Image must be selected and cropped!");
      } else {
        let croppedBase64Thumb = croppedBase64;
        let compressDecider = false;
        let qualityMain;
        let qualityThumb;
        let file = this.dataURLtoFile(croppedBase64, "tempImg.jpeg");
        if (file.size > 4000000) {
          compressDecider = true;
          qualityMain = 0.4;
          qualityThumb = 0.1;
        } else if (file.size > 150000) {
          compressDecider = true;
          qualityMain = 0.8;
          qualityThumb = 0.2;
        }
        if (compressDecider) {
          compress
            .compress([file], {
              size: 10, // the max size in MB, defaults to 2MB
              quality: qualityMain,
              resize: true,
            })
            .then((data) => {
              croppedBase64 = data[0].prefix.concat(data[0].data);
              document.getElementById("tempImg").src = croppedBase64;

              compress
                .compress([file], {
                  size: 10,
                  quality: qualityThumb,
                  resize: true,
                })
                .then((dataa) => {
                  croppedBase64Thumb = dataa[0].prefix.concat(dataa[0].data);
                  document.getElementById("tempImg2").src = croppedBase64Thumb;
                  document.getElementById("tempImgThumb").style.display =
                    "block";
                  if (category === "staff") {
                    let name = document
                      .getElementById("nameInput")
                      .value.trim()
                      .toLowerCase();
                    let email = document
                      .getElementById("emailInput")
                      .value.trim()
                      .toLowerCase();

                    if (name === "" || email === "") {
                      alert("Empty spaces are not allowed! Please try again!");
                    } else {
                      let updateKey =
                        document.getElementById("updateKeyInput").value;
                      let mainImage = this.dataURLtoFile(
                        croppedBase64,
                        "mainImage.jpeg"
                      );
                      let thumbImage = this.dataURLtoFile(
                        croppedBase64Thumb,
                        "thumbImage.jpeg"
                      );
                      let formData = new FormData();
                      formData.append("mainImage", mainImage);
                      formData.append("thumbImage", thumbImage);
                      formData.append("category", category);
                      formData.append("name", name);
                      formData.append("email", email);
                      formData.append("updateKey", updateKey);
                      axios
                        .post("/uploadNewData", formData, {
                          headers: {
                            "Content-Type": "multipart/form-data",
                          },
                        })
                        .then((res) => {
                          this.timeoutMsgTrigger(res.data);
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                    }
                  } else {
                    let rno = document
                      .getElementById("rnoInput")
                      .value.trim()
                      .toLowerCase();
                    let name = document
                      .getElementById("nameInput")
                      .value.trim()
                      .toLowerCase();
                    let pno = document.getElementById("pnoInput").value.trim();
                    let email = document
                      .getElementById("emailInput")
                      .value.trim()
                      .toLowerCase();
                    let address = document
                      .getElementById("addressInput")
                      .value.trim()
                      .toLowerCase();
                    if (
                      rno === "" ||
                      name === "" ||
                      pno === "" ||
                      email === "" ||
                      address === ""
                    ) {
                      alert("Empty spaces are not allowed! Please try again!");
                    } else {
                      let updateKey =
                        document.getElementById("updateKeyInput").value;
                      let mainImage = this.dataURLtoFile(
                        croppedBase64,
                        "mainImage.jpeg"
                      );
                      let thumbImage = this.dataURLtoFile(
                        croppedBase64Thumb,
                        "thumbImage.jpeg"
                      );
                      let formData = new FormData();
                      formData.append("mainImage", mainImage);
                      formData.append("thumbImage", thumbImage);
                      formData.append("category", category);
                      formData.append("name", name);
                      formData.append("updateKey", updateKey);
                      formData.append("rno", rno);
                      formData.append("pno", pno);
                      formData.append("email", email);
                      formData.append("address", address);
                      axios
                        .post("/uploadNewData", formData, {
                          headers: {
                            "Content-Type": "multipart/form-data",
                          },
                        })
                        .then((res) => {
                          this.timeoutMsgTrigger(res.data);
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                    }
                  }
                });
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          document.getElementById("tempImg").src = croppedBase64;
          document.getElementById("tempImg2").src = croppedBase64;
          document.getElementById("tempImgThumb").style.display = "block";
          if (category === "staff") {
            let name = document
              .getElementById("nameInput")
              .value.trim()
              .toLowerCase();
            let email = document
              .getElementById("emailInput")
              .value.trim()
              .toLowerCase();
            if (name === "" || email === "") {
              alert("Empty spaces are not allowed! Please try again!");
            } else {
              let updateKey = document.getElementById("updateKeyInput").value;
              let formData = new FormData();
              formData.append("mainImage", file);
              formData.append("thumbImage", file);
              formData.append("category", category);
              formData.append("name", name);
              formData.append("email", email);
              formData.append("updateKey", updateKey);
              axios
                .post("/uploadNewData", formData, {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                })
                .then((res) => {
                  this.timeoutMsgTrigger(res.data);
                })
                .catch((error) => {
                  console.log(error);
                });
            }
          } else {
            let rno = document
              .getElementById("rnoInput")
              .value.trim()
              .toLowerCase();
            let name = document
              .getElementById("nameInput")
              .value.trim()
              .toLowerCase();
            let pno = document.getElementById("pnoInput").value.trim();
            let email = document
              .getElementById("emailInput")
              .value.trim()
              .toLowerCase();
            let address = document
              .getElementById("addressInput")
              .value.trim()
              .toLowerCase();
            if (
              rno === "" ||
              name === "" ||
              pno === "" ||
              email === "" ||
              address === ""
            ) {
              alert("Empty spaces are not allowed! Please try again!");
            } else {
              let updateKey = document.getElementById("updateKeyInput").value;
              let formData = new FormData();
              formData.append("mainImage", file);
              formData.append("thumbImage", file);
              formData.append("category", category);
              formData.append("name", name);
              formData.append("updateKey", updateKey);
              formData.append("rno", rno);
              formData.append("pno", pno);
              formData.append("email", email);
              formData.append("address", address);
              axios
                .post("/uploadNewData", formData, {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                })
                .then((res) => {
                  this.timeoutMsgTrigger(res.data);
                })
                .catch((error) => {
                  console.log(error);
                });
            }
          }
        }
      }
    }
  };

  updatePhoto = (e) => {
    e.preventDefault();
    if (document.getElementById("rnoInput").value === "") {
      alert("Roll number must be selected for updating pictures!");
    } else {
      let croppedBase64 = document.getElementById("tempImg").src;
      if (croppedBase64.length < 50) {
        document.getElementById("fileSelectInput").value = "";
        document.getElementById("fileSelectLabel").innerHTML = "Choose file...";
        document.getElementById("tempImg").src = "";
        alert("Image must be selected and cropped!");
      } else {
        let croppedBase64Thumb = croppedBase64;
        let compressDecider = false;
        let qualityMain;
        let qualityThumb;
        let file = this.dataURLtoFile(croppedBase64, "tempImg.jpeg");
        if (file.size > 4000000) {
          compressDecider = true;
          qualityMain = 0.4;
          qualityThumb = 0.1;
        } else if (file.size > 150000) {
          compressDecider = true;
          qualityMain = 0.8;
          qualityThumb = 0.2;
        }
        if (compressDecider) {
          compress
            .compress([file], {
              size: 10, // the max size in MB, defaults to 2MB
              quality: qualityMain,
              resize: true,
            })
            .then((data) => {
              croppedBase64 = data[0].prefix.concat(data[0].data);
              document.getElementById("tempImg").src = croppedBase64;

              compress
                .compress([file], {
                  size: 10,
                  quality: qualityThumb,
                  resize: true,
                })
                .then((dataa) => {
                  croppedBase64Thumb = dataa[0].prefix.concat(dataa[0].data);
                  document.getElementById("tempImg2").src = croppedBase64Thumb;
                  document.getElementById("tempImgThumb").style.display =
                    "block";
                  let rno = document
                    .getElementById("rnoInput")
                    .value.trim()
                    .toLowerCase();
                  let updateKey =
                    document.getElementById("updateKeyInput").value;
                  let mainImage = this.dataURLtoFile(
                    croppedBase64,
                    "mainImage.jpeg"
                  );
                  let thumbImage = this.dataURLtoFile(
                    croppedBase64Thumb,
                    "thumbImage.jpeg"
                  );
                  let formData = new FormData();
                  formData.append("mainImage", mainImage);
                  formData.append("thumbImage", thumbImage);
                  formData.append("updateKey", updateKey);
                  formData.append("rno", rno);
                  axios
                    .post("/updatePhoto", formData, {
                      headers: {
                        "Content-Type": "multipart/form-data",
                      },
                    })
                    .then((res) => {
                      this.timeoutMsgTrigger(res.data);
                    })
                    .catch((error) => {
                      console.log(error);
                    });
                });
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          document.getElementById("tempImg").src = croppedBase64;
          document.getElementById("tempImg2").src = croppedBase64;
          document.getElementById("tempImgThumb").style.display = "block";
          let rno = document
            .getElementById("rnoInput")
            .value.trim()
            .toLowerCase();
          let updateKey = document.getElementById("updateKeyInput").value;
          let formData = new FormData();
          formData.append("mainImage", file);
          formData.append("thumbImage", file);
          formData.append("updateKey", updateKey);
          formData.append("rno", rno);
          axios
            .post("/updatePhoto", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
            .then((res) => {
              this.timeoutMsgTrigger(res.data);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      }
    }
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

  viewDetails = (e) => {
    try {
      if (personImageDataGlobal[e] !== undefined) {
        document.getElementById(
          "detailsModal"
        ).style.backgroundImage = `url(${personImageDataGlobal[e]})`;
      }
      if (personDetailsDataGlobal[e].category === "staff") {
        document.getElementById("detailsModalStudent").style.display = "none";
        document.getElementById("detailsModalStaff").style.display = "flex";
        this.setState(
          {
            detailsModalName: personDetailsDataGlobal[e].name,
            detailsModalEmail: personDetailsDataGlobal[e].email,
          },
          () => {
            document
              .getElementById("detailsModal")
              .classList.toggle("showDetailsModal");
            document.getElementById("body").classList.toggle("scrollBlocker");
          }
        );
      } else {
        document.getElementById("detailsModalStudent").style.display = "flex";
        document.getElementById("detailsModalStaff").style.display = "none";
        this.setState(
          {
            detailsModalName: personDetailsDataGlobal[e].name,
            detailsModalRno: personDetailsDataGlobal[e].rno,
            detailsModalEmail: personDetailsDataGlobal[e].email,
            detailsModalPno: personDetailsDataGlobal[e].pno,
            detailsModalAddress: personDetailsDataGlobal[e].address,
          },
          () => {
            document
              .getElementById("detailsModal")
              .classList.toggle("showDetailsModal");
            document.getElementById("body").classList.toggle("scrollBlocker");
          }
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  closeDetails = (e) => {
    try {
      document
        .getElementById("detailsModal")
        .classList.toggle("showDetailsModal");
      document.getElementById("body").classList.toggle("scrollBlocker");
    } catch (err) {
      console.log(err);
    }
  };

  getThumbImage = (e) => {
    try {
      if (personImageDataGlobal[e] === undefined) {
        axios
          .post("/getThumbImage", { personId: e })
          .then((res) => {
            if (res.data[0] === 0) {
              this.timeoutMsgTrigger(res.data[1]);
            } else if (res.data[0] === 1) {
              try {
                let src =
                  "data:image/jpeg;base64," +
                  this.hexToBase64(res.data[1][0].img.data);
                document.getElementById("thumb1" + e).src = src;
                document
                  .getElementById("thumb1" + e + "div")
                  .classList.remove("card-image-div-temp");
                document.getElementById("thumb1" + e).classList.add("loaded");
                document
                  .getElementById("cardStyle1" + e)
                  .classList.add("loaded");
                document
                  .getElementById("cardInfo1" + e)
                  .classList.add("loaded");

                document.getElementById("thumb2" + e).src = src;
                document
                  .getElementById("thumb2" + e + "div")
                  .classList.remove("card-image-div-temp");
                document.getElementById("thumb2" + e).classList.add("loaded");
                document
                  .getElementById("cardStyle2" + e)
                  .classList.add("loaded");
                document
                  .getElementById("cardInfo2" + e)
                  .classList.add("loaded");

                personImageDataGlobal[e] = src;
              } catch (errrr) { }
            }
          })
          .catch((err) => {
            console.error(err);
            if (this.state.requestAdmin === false) {
              this.timeoutMsgTrigger(
                "An error occured in frontend while retrieving image with PID : " +
                e +
                ". Contact admin."
              );
            }
          });
      } else {
        if (
          document
            .getElementById("cardStyle1" + e)
            .classList.contains("loaded") ||
          document.getElementById("cardStyle2" + e).classList.contains("loaded")
        ) {
        } else {
          document.getElementById("thumb1" + e).src = personImageDataGlobal[e];
          document
            .getElementById("thumb1" + e + "div")
            .classList.remove("card-image-div-temp");
          document.getElementById("thumb1" + e).classList.add("loaded");
          document.getElementById("cardStyle1" + e).classList.add("loaded");
          document.getElementById("cardInfo1" + e).classList.add("loaded");

          document.getElementById("thumb2" + e).src = personImageDataGlobal[e];
          document
            .getElementById("thumb2" + e + "div")
            .classList.remove("card-image-div-temp");
          document.getElementById("thumb2" + e).classList.add("loaded");
          document.getElementById("cardStyle2" + e).classList.add("loaded");
          document.getElementById("cardInfo2" + e).classList.add("loaded");
        }
      }
    } catch (error) {
      console.log("FAILED : ", error);
    }
  };

  sortArrayOfObjects = (a, b) => {
    if (a.rno < b.rno) {
      return -1;
    }
    if (a.rno > b.rno) {
      return 1;
    }
    return 0;
  };

  sortArrayOfStaff = (a, b) => {
    if (a.personId < b.personId) {
      return -1;
    }
    if (a.personId > b.personId) {
      return 1;
    }
    return 0;
  };

  returnOptions = (arr, staffDecider) => {
    let temp = [];
    let temp1 = [];
    if (staffDecider) {
      arr.forEach((item, i) => {
        temp.push({
          value: "cardStyle1" + item.personId,
          label: item.name,
        });
        temp1.push({
          value: "cardStyle2" + item.personId,
          label: item.name,
        });
      });
    } else {
      arr.forEach((item, i) => {
        temp.push({
          value: "cardStyle1" + item.personId,
          label: `${item.name} - ${item.rno.toUpperCase()}`,
        });
        temp1.push({
          value: "cardStyle2" + item.personId,
          label: `${item.name} - ${item.rno.toUpperCase()}`,
        });
      });
    }
    return [temp, temp1];
  };

  authenticate = (autoLogin, key) => {
    // e.preventDefault();
    if (!autoLogin) {
      document.getElementById("authErrorDiv").innerHTML = "&#160;";
      key = document.getElementById("authInput").value;
    }
    this.setState({ authenticated: "loading" });
    axios
      .post("/authenticator", { key: key, autoLogin: autoLogin })
      .then((res) => {
        if (res.data[0] === 0) {
          this.setState({ authenticated: false }, () => {
            document.getElementById("authErrorDiv").innerHTML = res.data[1];
          });
        } else if (res.data[0] === 1) {
          if (!autoLogin)
            localStorage.setItem("x_info", res.data[2])
          let cse1Data = [];
          let cse2Data = [];
          let cse3Data = [];
          let staffData = [];
          let allData = res.data[1];
          allData.forEach((item, i) => {
            personDetailsDataGlobal[item.personId] = item;
            if (item.category === "cse1") {
              cse1Data.push(item);
            } else if (item.category === "cse2") {
              cse2Data.push(item);
            } else if (item.category === "cse3") {
              cse3Data.push(item);
            } else if (item.category === "staff") {
              staffData.push(item);
            }
          });

          cse1Data.sort(this.sortArrayOfObjects);
          cse2Data.sort(this.sortArrayOfObjects);
          cse3Data.sort(this.sortArrayOfObjects);
          staffData.sort(this.sortArrayOfStaff);
          let cse1DataOptionsArr = this.returnOptions(cse1Data, false);
          let cse2DataOptionsArr = this.returnOptions(cse2Data, false);
          let cse3DataOptionsArr = this.returnOptions(cse3Data, false);
          let staffDataOptionsArr = this.returnOptions(staffData, true);

          this.setState(
            {
              cse1Data: cse1Data,
              cse2Data: cse2Data,
              cse3Data: cse3Data,
              staffData: staffData,
              allDataOptions: [
                {
                  label: "CSE 1",
                  options: cse1DataOptionsArr[0],
                },
                {
                  label: "CSE 2",
                  options: cse2DataOptionsArr[0],
                },
                {
                  label: "CSE 3",
                  options: cse3DataOptionsArr[0],
                },
                {
                  label: "STAFF",
                  options: staffDataOptionsArr[0],
                },
              ],
              cse1DataOptions: [
                {
                  label: "CSE 1",
                  options: cse1DataOptionsArr[1],
                },
              ],
              cse2DataOptions: [
                {
                  label: "CSE 2",
                  options: cse2DataOptionsArr[1],
                },
              ],
              cse3DataOptions: [
                {
                  label: "CSE 3",
                  options: cse3DataOptionsArr[1],
                },
              ],
              staffDataOptions: [
                {
                  label: "STAFF",
                  options: staffDataOptionsArr[1],
                },
              ],
              authenticated: true,
              displayData: "nopeisyes",
            },
            () => {
              try {
                document.getElementById("verifyOTP").disabled = true;
                window.$(function () {
                  window.$('[data-toggle="popover"]').popover();
                });
              } catch (err) {
                console.log(err);
              }
            }
          );
        }
      })
      .catch((err) => {
        console.error(err);
        this.setState({ authenticated: false }, () => {
          document.getElementById("authErrorDiv").innerHTML =
            "An error occured while authenticating";
        });
      });
  };

  authenticateAdmin = (e) => {
    e.preventDefault();
    document.getElementById("adminErrorDiv").innerHTML = "&#160;";
    this.setState({ authenticated: "loading" });
    let key = document.getElementById("adminInput").value;
    axios
      .post("/authenticatorAdmin", { key: key })
      .then((res) => {
        if (res.data[0] === 0) {
          this.setState({ authenticated: true, isAdmin: "NotYet" }, () => {
            document.getElementById("adminErrorDiv").innerHTML = res.data[1];
          });
        } else if (res.data[0] === 1) {
          this.setState(
            {
              authenticated: true,
              isAdmin: res.data[1],
              confirmAdm: "nopeisyes",
            },
            () => {
              window.$(document).ready(function () {
                window.$("#fileSelectInput").change(function (e) {
                  document.getElementById("tempImgThumb").style.display =
                    "none";
                  let img = e.target.files[0];
                  if (img === undefined) {
                    document.getElementById("fileSelectInput").value = "";
                    document.getElementById("fileSelectLabel").innerHTML =
                      "Choose file...";
                    document.getElementById("tempImg").src = "";
                    document.getElementById("tempImg2").src = "";
                    document.getElementById("tempImgThumb").style.display =
                      "none";
                  } else {
                    if (img.type !== "image/jpeg") {
                      document.getElementById("fileSelectInput").value = "";
                      document.getElementById("fileSelectLabel").innerHTML =
                        "Choose file...";
                      document.getElementById("tempImg").src = "";
                      alert("JPEG images are only accepted!");
                    } else if (img.size > 10490000) {
                      document.getElementById("fileSelectInput").value = "";
                      document.getElementById("fileSelectLabel").innerHTML =
                        "Choose file...";
                      document.getElementById("tempImg").src = "";
                      alert("Image size must be less than 10MB !");
                    } else {
                      let str = img.name;
                      let firstStr = str.slice(0, str.lastIndexOf("."));
                      let lastStr = str.slice(str.lastIndexOf("."));
                      if (firstStr.length > 7) {
                        document.getElementById("fileSelectLabel").innerHTML =
                          firstStr.slice(0, 8) + "..." + lastStr;
                      } else {
                        document.getElementById("fileSelectLabel").innerHTML =
                          firstStr + lastStr;
                      }
                      if (
                        !window.pixelarity.open(
                          img,
                          true,
                          function (res) {
                            document.getElementById("tempImg").src = res;
                          },
                          "jpg",
                          0.8
                        )
                      ) {
                        document.getElementById("fileSelectInput").value = "";
                        document.getElementById("fileSelectLabel").innerHTML =
                          "Choose file...";
                        document.getElementById("tempImg").src = "";
                        alert("JPEG images are only accepted!");
                      }
                    }
                  }
                });
              });
            }
          );
        }
      })
      .catch((err) => {
        console.error(err);
        this.setState(
          {
            authenticated: true,
            requestAdmin: true,
            isAdmin: "NotYet",
          },
          () => {
            document.getElementById("adminErrorDiv").innerHTML =
              "An error occured while authenticating";
          }
        );
      });
  };

  appPasswordChange = (e) => {
    e.preventDefault();
    let appPassword = document.getElementById("appPasswordInput").value;
    let updateKey = document.getElementById("appPasswordUpdateKeyInput").value;
    axios
      .post("/appPasswordChange", {
        updateKey: updateKey,
        appPassword: appPassword,
      })
      .then((res) => {
        this.timeoutMsgTrigger(res.data);
      })
      .catch((err) => {
        console.error(err);
        this.timeoutMsgTrigger("An error occured at the client side!");
      });
  };

  adminPasswordChange = (e) => {
    e.preventDefault();
    let adminPassword = document.getElementById("adminPasswordInput").value;
    let updateKey = document.getElementById(
      "adminPasswordUpdateKeyInput"
    ).value;
    axios
      .post("/adminPasswordChange", {
        updateKey: updateKey,
        adminPassword: adminPassword,
      })
      .then((res) => {
        this.timeoutMsgTrigger(res.data);
      })
      .catch((err) => {
        console.error(err);
        this.timeoutMsgTrigger("An error occured at the client side!");
      });
  };

  timeoutMsgTrigger = (e) => {
    document.getElementById("timeoutToast").style.display = "block";
    this.setState(
      {
        timeoutMsg: e,
        showTimeoutMsgTrigger: true,
      },
      () => {
        setTimeout(() => {
          if (this.state.showTimeoutMsgTrigger === true) {
            this.setState({ showTimeoutMsgTrigger: false }, () => {
              setTimeout(() => {
                document.getElementById("timeoutToast").style.display = "none";
              }, 500);
            });
          }
        }, 5000);
      }
    );
  };

  timeoutMsgCloser = (e) => {
    this.setState({ showTimeoutMsgTrigger: false }, () => {
      setTimeout(() => {
        document.getElementById("timeoutToast").style.display = "none";
      }, 500);
    });
  };

  handleCategoryInputChange = (e) => {
    document.getElementById("categoryInput").style.color = "#43383e";
    if (document.getElementById("categoryInput").value === "staff") {
      document.getElementById("rnoInputDiv").style.display = "none";
      document.getElementById("pnoInputDiv").style.display = "none";
      document.getElementById("addressInputDiv").style.display = "none";
      document.getElementById("rnoInput").value = "";
      document.getElementById("pnoInput").value = "";
      document.getElementById("addressInput").value = "";
      document.getElementById("rnoInput").required = false;
      document.getElementById("pnoInput").required = false;
      document.getElementById("addressInput").required = false;
    } else {
      document.getElementById("rnoInputDiv").style.display = "block";
      document.getElementById("pnoInputDiv").style.display = "block";
      document.getElementById("addressInputDiv").style.display = "block";
      document.getElementById("rnoInput").required = true;
      document.getElementById("pnoInput").required = true;
      document.getElementById("addressInput").required = true;
    }
  };

  updatePhotoInputChange = (e) => {
    if (document.getElementById("updatePhoto").checked) {
      document.getElementById("rnoInputDiv").style.display = "block";
      document.getElementById("rnoInput").required = true;
      document.getElementById("categoryInputDiv").style.display = "none";
      document.getElementById("nameInputDiv").style.display = "none";
      document.getElementById("pnoInputDiv").style.display = "none";
      document.getElementById("emailInputDiv").style.display = "none";
      document.getElementById("addressInputDiv").style.display = "none";
      document.getElementById("nameInput").value = "";
      document.getElementById("pnoInput").value = "";
      document.getElementById("emailInput").value = "";
      document.getElementById("addressInput").value = "";
      document.getElementById("nameInput").required = false;
      document.getElementById("pnoInput").required = false;
      document.getElementById("emailInput").required = false;
      document.getElementById("addressInput").required = false;
      document.getElementById("uploadButton").style.display = "none";
      document.getElementById("updatePictureButton").style.display =
        "inline-block";
    } else {
      document.getElementById("categoryInputDiv").style.display = "block";
      document.getElementById("categoryInput").value = "select";
      document.getElementById("rnoInputDiv").style.display = "block";
      document.getElementById("nameInputDiv").style.display = "block";
      document.getElementById("pnoInputDiv").style.display = "block";
      document.getElementById("emailInputDiv").style.display = "block";
      document.getElementById("addressInputDiv").style.display = "block";
      document.getElementById("rnoInput").required = true;
      document.getElementById("nameInput").required = true;
      document.getElementById("pnoInput").required = true;
      document.getElementById("emailInput").required = true;
      document.getElementById("addressInput").required = true;
      document.getElementById("uploadButton").style.display = "inline-block";
      document.getElementById("updatePictureButton").style.display = "none";
    }
  };

  scrollToId = (e) => {
    window.$("html, body").animate(
      {
        scrollTop: window.$("#" + e).offset().top,
      },
      800
    );
  };

  searchBarVisibilitySwap = (decoy, main) => {
    document.getElementById(decoy).style.opacity = 0;
    document.getElementById(main).style.visibility = "visible";
    setTimeout(() => {
      document.getElementById(main).style.marginTop = "10px";
      document.getElementById(decoy).style.visibility = "hidden";
      document.getElementById(main).style.opacity = 1;
    }, 500);
  };

  directPageShift = (e) => {
    document.getElementById(e).scrollIntoView();
  };

  handleOTPChange = (e) => {
    this.setState({ otpEntered: e }, () => {
      if (e.toString().length === 5) {
        document.getElementById("verifyOTP").disabled = false;
      } else {
        document.getElementById("verifyOTP").disabled = true;
      }
    });
  };

  requestOTP = (e) => {
    e.preventDefault();
    document.getElementById("otpInputDiv").style.visibility = "hidden";
    this.setState({ otpEntered: 0 });
    document.getElementById("verifyOTP").disabled = true;
    document.getElementById("otpInfo").innerHTML = "";
    let email = document.getElementById("approveEmail").value.trim();
    if (email === "") {
      document.getElementById("otpInfo").innerHTML =
        '<strong class = "otpError">Email is mandatory!</strong>';
    } else {
      document.getElementById("requestOTPSpinner").style.visibility = "visible";
      document.getElementById("approveEmail").disabled = true;
      axios
        .post("/requestOTP", { email: email })
        .then((res) => {
          document.getElementById("requestOTPSpinner").style.visibility =
            "hidden";
          if (res.data[0] === 0) {
            document.getElementById("approveEmail").disabled = false;
            document.getElementById(
              "otpInfo"
            ).innerHTML = `<strong class = "otpError">${res.data[1]}</strong>`;
          } else if (res.data[0] === 1) {
            document.getElementById("otpInputDiv").style.visibility = "visible";
            document.getElementById(
              "otpInfo"
            ).innerHTML = `<strong class = "otpSuccess">${res.data[1]}</strong>`;
          }
        })
        .catch((err) => {
          console.error(err);
          document.getElementById("requestOTPSpinner").style.visibility =
            "hidden";
          document.getElementById("approveEmail").disabled = false;
          document.getElementById("otpInfo").innerHTML =
            '<strong class = "otpError">An error occured at the client side while requesting OTP! Contact Admin.</strong>';
        });
    }
  };

  verifyOTP = (e) => {
    document.getElementById("otpInfo").innerHTML = "";
    let email = document.getElementById("approveEmail").value.trim();
    if (email === "") {
      document.getElementById("otpInfo").innerHTML =
        '<strong class = "otpError">Email is mandatory!</strong>';
    } else if (this.state.otpEntered.toString().length !== 5) {
      document.getElementById("otpInfo").innerHTML =
        '<strong class = "otpError">OTP is mandatory!</strong>';
    } else {
      document.getElementById("verifyOTPSpinner").style.visibility = "visible";
      axios
        .post("/verifyOTP", {
          email: email,
          otp: this.state.otpEntered,
        })
        .then((res) => {
          document.getElementById("verifyOTPSpinner").style.visibility =
            "hidden";
          if (res.data[0] === 0) {
            document.getElementById(
              "otpInfo"
            ).innerHTML = `<strong class = "otpError">${res.data[1]}</strong>`;
          } else if (res.data[0] === 1) {
            document.getElementById(
              "otpInfo"
            ).innerHTML = `<strong class = "otpSuccess">${res.data[1]}</strong>`;
            document.getElementById("approveEmail").value = "";
            document.getElementById("approveEmail").disabled = false;
            document.getElementById("otpInputDiv").style.visibility = "hidden";
            this.setState({ otpEntered: 0 });
            document.getElementById("verifyOTPSpinner").style.visibility =
              "hidden";
            document.getElementById("requestOTPSpinner").style.visibility =
              "hidden";
            document.getElementById("verifyOTP").disabled = true;
          }
        })
        .catch((err) => {
          console.error(err);
          document.getElementById("verifyOTPSpinner").style.visibility =
            "hidden";
          document.getElementById("approveEmail").disabled = false;
          document.getElementById("otpInfo").innerHTML =
            '<strong class = "otpError">An error occured at the client side while verifying OTP! Contact Admin.</strong>';
        });
    }
  };

  pageReload = (e) => {
    window.location.reload();
  };

  render() {
    if (this.state.authenticated === false) {
      return (
        <div id="App" className="App">
          <Fade top duration={500} when={this.state.showTimeoutMsgTrigger}>
            <div className="timeoutToast max-widther" id="timeoutToast">
              {this.state.timeoutMsg}{" "}
              <MdCancel
                className="timeoutMsgCloserIcon"
                title="Tap to close"
                onClick={this.timeoutMsgCloser}
              />
            </div>
          </Fade>
          <div
            className="navbar-brand-in-details authBrand"
            onClick={this.pageReload}
          >
            <FaCode size={isMobile ? "25px" : "30px"} className="brandIcon logoLogo" />
            <div className="logoText">
              CSE 2020
              <span className="textAllOver">
                {isMobile ? "FIND AND RECONNECT" : "FIND AND RECONNECT WITH"}
                <br />
                {isMobile ? "WITH B.TECH CLASSMATES." : "B.TECH CLASSMATES."}
              </span>
            </div>
          </div>
          <div className="authForm max-widther">
            <div className="authContainer">
              <div className="authHead">Authenticate yourself</div>
              <div className="authFormDiv">
                <form onSubmit={e => this.authenticate(false, null)}>
                  <input
                    className="authInput"
                    id="authInput"
                    type="password"
                    placeholder="Enter the key"
                    autoComplete="off"
                    required
                  />
                  <div className="authErrorDiv" id="authErrorDiv">
                    &#160;
                  </div>
                  <button type="submit" className="authSubmit">
                    LOGIN
                  </button>
                </form>
              </div>
              <div className="authFooter">
                <div className="authFooterUp">
                  Problem with the login or forgot the key?
                </div>
                <div>
                  <a
                    href="mailto:vrsec2020@gmail.com?subject=Problem%20with%20login%20/%20Forgot%20the%20key"
                    className="authFooterDown"
                  >
                    CONTACT HERE
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (this.state.authenticated === "loading") {
      return (
        <div className="ipl-progress-indicator" id="ipl-progress-indicator">
          <Fade top duration={500} when={this.state.showTimeoutMsgTrigger}>
            <div className="timeoutToast" id="timeoutToast">
              {this.state.timeoutMsg}{" "}
              <MdCancel
                className="timeoutMsgCloserIcon"
                title="Tap to close"
                onClick={this.timeoutMsgCloser}
              />
            </div>
          </Fade>
          <div className="ipl-progress-indicator-head">
            <div className="first-indicator"></div>
            <div className="second-indicator"></div>
          </div>
          <div className="insp-logo-frame">
            <svg
              className="insp-logo-frame-img"
              version="1.1"
              id="L3"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              viewBox="0 0 100 100"
              enableBackground="new 0 0 0 0"
              xmlSpace="preserve"
            >
              <filter id="code" x="0%" y="0%" width="100%" height="100%">
                <feImage xlinkHref={process.env.PUBLIC_URL + "./favicon.png"} />
              </filter>
              <circle
                filter="url(#code)"
                stroke={isMobile ? "gray" : "#fff"}
                strokeWidth="4"
                cx="50"
                cy="50"
                r="44"
                style={{ opacity: 0.5 }}
              ></circle>
              <circle
                fill="#000"
                stroke="none"
                strokeWidth="3"
                cx="8"
                cy="54"
                r="2.5"
              >
                <animateTransform
                  attributeName="transform"
                  dur="1s"
                  type="rotate"
                  from="0 52 48"
                  to="360 50 52"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
        </div>
      );
    } else if (this.state.authenticated === true) {
      if (this.state.displayData === "nopeisyes") {
        if (this.state.requestAdmin === false) {
          return (
            <div className="App mainDisplay" id="App">
              <Fade
                top
                duration={500}
                when={this.state.showTimeoutMsgTrigger}
              >
                <div className="timeoutToast max-widther" id="timeoutToast">
                  {this.state.timeoutMsg}{" "}
                  <MdCancel
                    className="timeoutMsgCloserIcon"
                    title="Tap to close"
                    onClick={this.timeoutMsgCloser}
                  />
                </div>
              </Fade>

              <div
                className="modal fade"
                id="approveModal"
                tabIndex="-1"
                role="dialog"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
              >
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="exampleModalLabel">
                        Approval
                      </h5>
                      <button
                        type="button"
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="approvalDescription">
                        <strong>
                          Approval to display your phone number in this app.
                        </strong>
                        <br />
                        This approval will help our classmates to stay
                        connected using your phone number.
                      </div>
                      <form id="otpEmailForm" onSubmit={this.requestOTP}>
                        <div className="form-group">
                          <label htmlFor="approveEmail">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            id="approveEmail"
                            placeholder="Enter you email"
                            required
                          />
                        </div>
                      </form>
                      <div className="otpInputDiv" id="otpInputDiv">
                        <OtpInput
                          onChange={this.handleOTPChange}
                          value={this.state.otpEntered}
                          numInputs={5}
                          separator={<span>&nbsp;&nbsp;-&nbsp;&nbsp;</span>}
                          inputStyle="otpInputStyle"
                          containerStyle="otpContainerStyle"
                          isInputNum={true}
                          required
                        />
                      </div>
                      <div className="otpInfo" id="otpInfo"></div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-dismiss="modal"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        form="otpEmailForm"
                        className="btn btn-primary"
                        id="requestOTP"
                      >
                        Request OTP
                        <span
                          className="otpSpinner spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                          id="requestOTPSpinner"
                        ></span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        id="verifyOTP"
                        onClick={this.verifyOTP}
                      >
                        Submit OTP
                        <span
                          className="otpSpinner spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                          id="verifyOTPSpinner"
                        ></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <Fade top duration={1500}>
                <div className="hero-wrap max-widther">
                  <img
                    className="backgr"
                    src={linesBackground}
                    alt="cse2020"
                  />
                  <div className="overlay"></div>
                  <div className="contain">
                    <nav className="navbar navbar-expand-lg navbar-light">
                      <div
                        className="navbar-brand mr-auto"
                        onClick={this.pageReload}
                      >
                        <Zoom left delay={800} duration={2300}>
                          <div
                            style={{
                              display: "inline-block",
                            }}
                          >
                            <FaCode size="30px" className="brandIcon" />
                          </div>
                        </Zoom>
                        <Zoom left delay={800} duration={2100}>
                          <div
                            style={{
                              display: "inline-block",
                            }}
                          >
                            C
                          </div>
                        </Zoom>
                        <Zoom left delay={800} duration={1900}>
                          <div
                            style={{
                              display: "inline-block",
                            }}
                          >
                            S
                          </div>
                        </Zoom>
                        <Zoom left delay={800} duration={1700}>
                          <div
                            style={{
                              display: "inline-block",
                            }}
                          >
                            E
                          </div>
                        </Zoom>
                        <Zoom left delay={800} duration={1500}>
                          <div
                            style={{
                              display: "inline-block",
                            }}
                          >
                            &nbsp;
                          </div>
                        </Zoom>
                        <Zoom right delay={800} duration={1500}>
                          <div
                            style={{
                              display: "inline-block",
                            }}
                          >
                            2
                          </div>
                        </Zoom>
                        <Zoom right delay={800} duration={1700}>
                          <div
                            style={{
                              display: "inline-block",
                            }}
                          >
                            0
                          </div>
                        </Zoom>
                        <Zoom right delay={800} duration={1900}>
                          <div
                            style={{
                              display: "inline-block",
                            }}
                          >
                            2
                          </div>
                        </Zoom>
                        <Zoom right delay={800} duration={2100}>
                          <div
                            style={{
                              display: "inline-block",
                            }}
                          >
                            0
                          </div>
                        </Zoom>
                      </div>
                      <button
                        className="navbar-toggler"
                        type="button"
                        data-toggle="collapse"
                        data-target="#navbarNavDropdown"
                        aria-controls="navbarNavDropdown"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                      >
                        <span className="navbar-toggler-icon"></span>
                      </button>
                      <div
                        className="collapse navbar-collapse"
                        id="navbarNavDropdown"
                      >
                        <div className="navbar-nav">
                          <div className="nav-item">
                            <div className="navOptions nav-link" href="#">
                              <div
                                className="navbar-brand1"
                                data-toggle="modal"
                                data-target="#approveModal"
                              >
                                <Fade duration={500}>Approve</Fade>
                              </div>
                            </div>
                          </div>
                          <div className="nav-item">
                            <div className="navOptions nav-link" href="#">
                              <div
                                className="navbar-brand1"
                                onClick={() => this.directPageShift("footer")}
                              >
                                <Fade duration={500}>About</Fade>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </nav>

                    <div className="mainText">
                      <div>
                        <div className="textDia">
                          <Fade left cascade delay={2800} duration={500}>
                            <div>
                              <div>
                                <div className="textDiaInner">DIGITAL</div>
                              </div>
                              <div>
                                <div className="textDiaInner">ALBUM</div>
                              </div>
                              <div>
                                <div className="textDiaInner">FOR</div>
                              </div>
                              <div>
                                <div className="textDiaInner">CSE2020</div>
                              </div>
                            </div>
                          </Fade>
                        </div>
                        <Fade delay={3200}>
                          <div className="brandDescription">
                            <div>
                              <FaGraduationCap />
                              Graduation is an exciting time. It's both an
                              ending and a beginning.
                            </div>
                            <div>
                              It's warm memories of the past and big dreams
                              for the future.
                            </div>
                            <div
                              style={{
                                color: "white",
                              }}
                            >
                              Thanks for the truckload of good times.
                            </div>
                          </div>
                        </Fade>
                      </div>
                    </div>
                  </div>
                  <div className="mouse">
                    <div
                      onClick={() => this.scrollToId("contentScrollerToTabs")}
                      className="mouse-icon"
                    >
                      <FaChevronDown className="PageDownArrow" />
                    </div>
                  </div>
                </div>
              </Fade>
              <div className="max-widther">
                <span id="contentScrollerToTabs"></span>
                <div className="stickyNav" id="stickyNav">
                  <nav>
                    <div className="nav nav-tabs" id="nav-tab" role="tablist">
                      <Fade duration={1000}>
                        <div
                          className="stickyTab nav-item nav-link active"
                          id="nav-all-tab"
                          data-toggle="tab"
                          href="#nav-all"
                          role="tab"
                          aria-controls="nav-all"
                          aria-selected="true"
                          onClick={() =>
                            this.scrollToId("contentScrollerToTabs")
                          }
                        >
                          ALL
                        </div>
                        <div
                          className="stickyTab nav-item nav-link"
                          id="nav-cse1-tab"
                          data-toggle="tab"
                          href="#nav-cse1"
                          role="tab"
                          aria-controls="nav-cse1"
                          aria-selected="false"
                          onClick={() =>
                            this.scrollToId("contentScrollerToTabs")
                          }
                        >
                          CSE 1
                        </div>
                        <div
                          className="stickyTab nav-item nav-link"
                          id="nav-cse2-tab"
                          data-toggle="tab"
                          href="#nav-cse2"
                          role="tab"
                          aria-controls="nav-cse2"
                          aria-selected="false"
                          onClick={() =>
                            this.scrollToId("contentScrollerToTabs")
                          }
                        >
                          CSE 2
                        </div>
                        <div
                          className="stickyTab nav-item nav-link"
                          id="nav-cse3-tab"
                          data-toggle="tab"
                          href="#nav-cse3"
                          role="tab"
                          aria-controls="nav-cse3"
                          aria-selected="false"
                          onClick={() =>
                            this.scrollToId("contentScrollerToTabs")
                          }
                        >
                          CSE 3
                        </div>
                        <div
                          className="stickyTab nav-item nav-link"
                          id="nav-staff-tab"
                          data-toggle="tab"
                          href="#nav-staff"
                          role="tab"
                          aria-controls="nav-staff"
                          aria-selected="false"
                          onClick={() =>
                            this.scrollToId("contentScrollerToTabs")
                          }
                        >
                          STAFF
                        </div>
                      </Fade>
                    </div>
                  </nav>
                </div>

                <div className="tab-content" id="nav-tabContent">
                  <div
                    className="tab-pane fade show active"
                    id="nav-all"
                    role="tabpanel"
                    aria-labelledby="nav-all-tab"
                  >
                    <section className="ftco-section ftco-no-pb">
                      <div className="searchBarCenter">
                        <Fade>
                          <div
                            className="searchBarOverlay max-widther"
                            id="searchBarOverlayAll"
                          >
                            <span
                              className="searchIconSpan"
                              onClick={() =>
                                this.searchBarVisibilitySwap(
                                  "searchBarOverlayAll",
                                  "searchBarAll"
                                )
                              }
                            >
                              <FiSearch className="searchIcon" />
                            </span>
                          </div>
                        </Fade>
                        <div className="searchBarDiv" id="searchBarAll">
                          <Select
                            className="searchBar"
                            options={this.state.allDataOptions}
                            formatGroupLabel={formatGroupLabel}
                            isClearable
                            isSearchable
                            placeholder={
                              <div>Search for name or roll number...</div>
                            }
                            onChange={this.searchDealer}
                          />
                        </div>
                      </div>
                      <Fade bottom duration={300}>
                        <div className="sectionHeader">
                          <div className="row justify-content-center">
                            <div className="col-md-12 heading-section text-center">
                              <span className="subheading">
                                CSE 1
                              </span>
                            </div>
                          </div>
                        </div>
                      </Fade>
                      <div className="card-list" id="card-list">
                        {this.state.cse1Data.map((item, index) => (
                          <Fade
                            bottom
                            duration={400}
                            key={index}
                            onReveal={() => this.getThumbImage(item.personId)}
                          >
                            <div className="cardStyleProtector">
                              <div
                                className="cardStyle"
                                id={"cardStyle1" + item.personId}
                              >
                                <div
                                  className="card-image-div card-image-div-temp"
                                  id={"thumb1" + item.personId + "div"}
                                >
                                  <img
                                    src="#"
                                    alt="NotLoaded"
                                    className="card-image"
                                    id={"thumb1" + item.personId}
                                  />
                                </div>
                                <div
                                  className="card-info"
                                  id={"cardInfo1" + item.personId}
                                >
                                  <div className="card-info-name">
                                    {item.name}
                                  </div>
                                </div>
                                <div className="card-features">
                                  <div
                                    className="card-features-button"
                                    onClick={() =>
                                      this.viewDetails(item.personId)
                                    }
                                  >
                                    View Details
                                  </div>
                                </div>
                                <div
                                  className="cardStyleHighlight"
                                  id={
                                    "cardStyle1" + item.personId + "Highlight"
                                  }
                                ></div>
                              </div>
                            </div>
                          </Fade>
                        ))}
                      </div>
                      <Fade bottom duration={300}>
                        <div className="sectionHeader">
                          <div className="row justify-content-center">
                            <div className="col-md-12 heading-section text-center">
                              <span className="subheading">
                                CSE 2
                              </span>
                            </div>
                          </div>
                        </div>
                      </Fade>
                      <div className="card-list" id="card-list">
                        {this.state.cse2Data.map((item, index) => (
                          <Fade
                            bottom
                            duration={400}
                            key={index}
                            onReveal={() => this.getThumbImage(item.personId)}
                          >
                            <div className="cardStyleProtector">
                              <div
                                className="cardStyle"
                                id={"cardStyle1" + item.personId}
                              >
                                <div
                                  className="card-image-div card-image-div-temp"
                                  id={"thumb1" + item.personId + "div"}
                                >
                                  <img
                                    src="#"
                                    alt="NotLoaded"
                                    className="card-image"
                                    id={"thumb1" + item.personId}
                                  />
                                </div>
                                <div
                                  className="card-info"
                                  id={"cardInfo1" + item.personId}
                                >
                                  <div className="card-info-name">
                                    {item.name}
                                  </div>
                                </div>
                                <div className="card-features">
                                  <div
                                    className="card-features-button"
                                    onClick={() =>
                                      this.viewDetails(item.personId)
                                    }
                                  >
                                    View Details
                                  </div>
                                </div>
                                <div
                                  className="cardStyleHighlight"
                                  id={
                                    "cardStyle1" + item.personId + "Highlight"
                                  }
                                ></div>
                              </div>
                            </div>
                          </Fade>
                        ))}
                      </div>
                      <Fade bottom duration={300}>
                        <div className="sectionHeader">
                          <div className="row justify-content-center">
                            <div className="col-md-12 heading-section text-center">
                              <span className="subheading">
                                CSE 3
                              </span>
                            </div>
                          </div>
                        </div>
                      </Fade>
                      <div className="card-list" id="card-list">
                        {this.state.cse3Data.map((item, index) => (
                          <Fade
                            bottom
                            duration={400}
                            key={index}
                            onReveal={() => this.getThumbImage(item.personId)}
                          >
                            <div className="cardStyleProtector">
                              <div
                                className="cardStyle"
                                id={"cardStyle1" + item.personId}
                              >
                                <div
                                  className="card-image-div card-image-div-temp"
                                  id={"thumb1" + item.personId + "div"}
                                >
                                  <img
                                    src="#"
                                    alt="NotLoaded"
                                    className="card-image"
                                    id={"thumb1" + item.personId}
                                  />
                                </div>
                                <div
                                  className="card-info"
                                  id={"cardInfo1" + item.personId}
                                >
                                  <div className="card-info-name">
                                    {item.name}
                                  </div>
                                </div>
                                <div className="card-features">
                                  <div
                                    className="card-features-button"
                                    onClick={() =>
                                      this.viewDetails(item.personId)
                                    }
                                  >
                                    View Details
                                  </div>
                                </div>
                                <div
                                  className="cardStyleHighlight"
                                  id={
                                    "cardStyle1" + item.personId + "Highlight"
                                  }
                                ></div>
                              </div>
                            </div>
                          </Fade>
                        ))}
                      </div>
                      <Fade bottom duration={300}>
                        <div className="sectionHeader">
                          <div className="row justify-content-center">
                            <div className="col-md-12 heading-section text-center">
                              <span className="subheading">
                                STAFF
                              </span>
                            </div>
                          </div>
                        </div>
                      </Fade>
                      <div className="card-list" id="card-list">
                        {this.state.staffData.map((item, index) => (
                          <Fade
                            bottom
                            duration={400}
                            key={index}
                            onReveal={() => this.getThumbImage(item.personId)}
                          >
                            <div className="cardStyleProtector">
                              <div
                                className="cardStyle"
                                id={"cardStyle1" + item.personId}
                              >
                                <div
                                  className="card-image-div card-image-div-temp"
                                  id={"thumb1" + item.personId + "div"}
                                >
                                  <img
                                    src="#"
                                    alt="NotLoaded"
                                    className="card-image"
                                    id={"thumb1" + item.personId}
                                  />
                                </div>
                                <div
                                  className="card-info"
                                  id={"cardInfo1" + item.personId}
                                >
                                  <div className="card-info-name">
                                    {item.name}
                                  </div>
                                </div>
                                <div className="card-features">
                                  <div
                                    className="card-features-button"
                                    onClick={() =>
                                      this.viewDetails(item.personId)
                                    }
                                  >
                                    View Details
                                  </div>
                                </div>
                                <div
                                  className="cardStyleHighlight"
                                  id={
                                    "cardStyle1" + item.personId + "Highlight"
                                  }
                                ></div>
                              </div>
                            </div>
                          </Fade>
                        ))}
                      </div>
                    </section>
                  </div>
                  <div
                    className="tab-pane fade"
                    id="nav-cse1"
                    role="tabpanel"
                    aria-labelledby="nav-cse1-tab"
                  >
                    <section className="ftco-section ftco-no-pb">
                      <div className="searchBarCenter">
                        <Fade>
                          <div
                            className="searchBarOverlay max-widther"
                            id="searchBarOverlayCSE1"
                          >
                            <span
                              className="searchIconSpan"
                              onClick={() =>
                                this.searchBarVisibilitySwap(
                                  "searchBarOverlayCSE1",
                                  "searchBarCSE1"
                                )
                              }
                            >
                              <FiSearch className="searchIcon" />
                            </span>
                          </div>
                        </Fade>
                        <div className="searchBarDiv" id="searchBarCSE1">
                          <Select
                            className="searchBar"
                            options={this.state.cse1DataOptions}
                            formatGroupLabel={formatGroupLabel}
                            isClearable
                            isSearchable
                            onChange={this.searchDealer}
                            placeholder={
                              <div>Search for name or roll number...</div>
                            }
                          />
                        </div>
                      </div>
                      <Fade bottom duration={300}>
                        <div className="sectionHeader">
                          <div className="row justify-content-center">
                            <div className="col-md-12 heading-section text-center">
                              <span className="subheading">
                                CSE 1
                              </span>
                            </div>
                          </div>
                        </div>
                      </Fade>
                      <div className="card-list" id="card-list">
                        {this.state.cse1Data.map((item, index) => (
                          <Fade
                            bottom
                            duration={400}
                            key={index}
                            onReveal={() => this.getThumbImage(item.personId)}
                          >
                            <div className="cardStyleProtector">
                              <div
                                className="cardStyle"
                                id={"cardStyle2" + item.personId}
                              >
                                <div
                                  className="card-image-div card-image-div-temp"
                                  id={"thumb2" + item.personId + "div"}
                                >
                                  <img
                                    src="#"
                                    alt="NotLoaded"
                                    className="card-image"
                                    id={"thumb2" + item.personId}
                                  />
                                </div>
                                <div
                                  className="card-info"
                                  id={"cardInfo2" + item.personId}
                                >
                                  <div className="card-info-name">
                                    {item.name}
                                  </div>
                                </div>
                                <div className="card-features">
                                  <div
                                    className="card-features-button"
                                    onClick={() =>
                                      this.viewDetails(item.personId)
                                    }
                                  >
                                    View Details
                                  </div>
                                </div>
                                <div
                                  className="cardStyleHighlight"
                                  id={
                                    "cardStyle2" + item.personId + "Highlight"
                                  }
                                ></div>
                              </div>
                            </div>
                          </Fade>
                        ))}
                      </div>
                    </section>
                  </div>
                  <div
                    className="tab-pane fade"
                    id="nav-cse2"
                    role="tabpanel"
                    aria-labelledby="nav-cse2-tab"
                  >
                    <section className="ftco-section ftco-no-pb">
                      <div className="searchBarCenter">
                        <Fade>
                          <div
                            className="searchBarOverlay max-widther"
                            id="searchBarOverlayCSE2"
                          >
                            <span
                              className="searchIconSpan"
                              onClick={() =>
                                this.searchBarVisibilitySwap(
                                  "searchBarOverlayCSE2",
                                  "searchBarCSE2"
                                )
                              }
                            >
                              <FiSearch className="searchIcon" />
                            </span>
                          </div>
                        </Fade>
                        <div className="searchBarDiv" id="searchBarCSE2">
                          <Select
                            className="searchBar"
                            options={this.state.cse2DataOptions}
                            formatGroupLabel={formatGroupLabel}
                            isClearable
                            isSearchable
                            onChange={this.searchDealer}
                            placeholder={
                              <div>Search for name or roll number...</div>
                            }
                          />
                        </div>
                      </div>
                      <Fade bottom duration={300}>
                        <div className="sectionHeader">
                          <div className="row justify-content-center">
                            <div className="col-md-12 heading-section text-center">
                              <span className="subheading">
                                CSE 2
                              </span>
                            </div>
                          </div>
                        </div>
                      </Fade>
                      <div className="card-list" id="card-list">
                        {this.state.cse2Data.map((item, index) => (
                          <Fade
                            bottom
                            duration={400}
                            key={index}
                            onReveal={() => this.getThumbImage(item.personId)}
                          >
                            <div className="cardStyleProtector">
                              <div
                                className="cardStyle"
                                id={"cardStyle2" + item.personId}
                              >
                                <div
                                  className="card-image-div card-image-div-temp"
                                  id={"thumb2" + item.personId + "div"}
                                >
                                  <img
                                    src="#"
                                    alt="NotLoaded"
                                    className="card-image"
                                    id={"thumb2" + item.personId}
                                  />
                                </div>
                                <div
                                  className="card-info"
                                  id={"cardInfo2" + item.personId}
                                >
                                  <div className="card-info-name">
                                    {item.name}
                                  </div>
                                </div>
                                <div className="card-features">
                                  <div
                                    className="card-features-button"
                                    onClick={() =>
                                      this.viewDetails(item.personId)
                                    }
                                  >
                                    View Details
                                  </div>
                                </div>
                                <div
                                  className="cardStyleHighlight"
                                  id={
                                    "cardStyle2" + item.personId + "Highlight"
                                  }
                                ></div>
                              </div>
                            </div>
                          </Fade>
                        ))}
                      </div>
                    </section>
                  </div>
                  <div
                    className="tab-pane fade"
                    id="nav-cse3"
                    role="tabpanel"
                    aria-labelledby="nav-cse3-tab"
                  >
                    <section className="ftco-section ftco-no-pb">
                      <div className="searchBarCenter">
                        <Fade>
                          <div
                            className="searchBarOverlay max-widther"
                            id="searchBarOverlayCSE3"
                          >
                            <span
                              className="searchIconSpan"
                              onClick={() =>
                                this.searchBarVisibilitySwap(
                                  "searchBarOverlayCSE3",
                                  "searchBarCSE3"
                                )
                              }
                            >
                              <FiSearch className="searchIcon" />
                            </span>
                          </div>
                        </Fade>
                        <div className="searchBarDiv" id="searchBarCSE3">
                          <Select
                            className="searchBar"
                            options={this.state.cse3DataOptions}
                            formatGroupLabel={formatGroupLabel}
                            isClearable
                            isSearchable
                            onChange={this.searchDealer}
                            placeholder={
                              <div>Search for name or roll number...</div>
                            }
                          />
                        </div>
                      </div>
                      <Fade bottom duration={300}>
                        <div className="sectionHeader">
                          <div className="row justify-content-center">
                            <div className="col-md-12 heading-section text-center">
                              <span className="subheading">
                                CSE 3
                              </span>
                            </div>
                          </div>
                        </div>
                      </Fade>
                      <div className="card-list" id="card-list">
                        {this.state.cse3Data.map((item, index) => (
                          <Fade
                            bottom
                            duration={400}
                            key={index}
                            onReveal={() => this.getThumbImage(item.personId)}
                          >
                            <div className="cardStyleProtector">
                              <div
                                className="cardStyle"
                                id={"cardStyle2" + item.personId}
                              >
                                <div
                                  className="card-image-div card-image-div-temp"
                                  id={"thumb2" + item.personId + "div"}
                                >
                                  <img
                                    src="#"
                                    alt="NotLoaded"
                                    className="card-image"
                                    id={"thumb2" + item.personId}
                                  />
                                </div>
                                <div
                                  className="card-info"
                                  id={"cardInfo2" + item.personId}
                                >
                                  <div className="card-info-name">
                                    {item.name}
                                  </div>
                                </div>
                                <div className="card-features">
                                  <div
                                    className="card-features-button"
                                    onClick={() =>
                                      this.viewDetails(item.personId)
                                    }
                                  >
                                    View Details
                                  </div>
                                </div>
                                <div
                                  className="cardStyleHighlight"
                                  id={
                                    "cardStyle2" + item.personId + "Highlight"
                                  }
                                ></div>
                              </div>
                            </div>
                          </Fade>
                        ))}
                      </div>
                    </section>
                  </div>
                  <div
                    className="tab-pane fade"
                    id="nav-staff"
                    role="tabpanel"
                    aria-labelledby="nav-staff-tab"
                  >
                    <section className="ftco-section ftco-no-pb">
                      <div className="searchBarCenter">
                        <Fade>
                          <div
                            className="searchBarOverlay max-widther"
                            id="searchBarOverlayStaff"
                          >
                            <span
                              className="searchIconSpan"
                              onClick={() =>
                                this.searchBarVisibilitySwap(
                                  "searchBarOverlayStaff",
                                  "searchBarStaff"
                                )
                              }
                            >
                              <FiSearch className="searchIcon" />
                            </span>
                          </div>
                        </Fade>
                        <div className="searchBarDiv" id="searchBarStaff">
                          <Select
                            className="searchBar"
                            options={this.state.staffDataOptions}
                            formatGroupLabel={formatGroupLabel}
                            isClearable
                            isSearchable
                            onChange={this.searchDealer}
                            placeholder={<div>Search for name...</div>}
                          />
                        </div>
                      </div>
                      <Fade bottom duration={300}>
                        <div className="sectionHeader">
                          <div className="row justify-content-center">
                            <div className="col-md-12 heading-section text-center">
                              <span className="subheading">
                                STAFF
                              </span>
                            </div>
                          </div>
                        </div>
                      </Fade>
                      <div className="card-list" id="card-list">
                        {this.state.staffData.map((item, index) => (
                          <Fade
                            bottom
                            duration={400}
                            key={index}
                            onReveal={() => this.getThumbImage(item.personId)}
                          >
                            <div className="cardStyleProtector">
                              <div
                                className="cardStyle"
                                id={"cardStyle2" + item.personId}
                              >
                                <div
                                  className="card-image-div card-image-div-temp"
                                  id={"thumb2" + item.personId + "div"}
                                >
                                  <img
                                    src="#"
                                    alt="NotLoaded"
                                    className="card-image"
                                    id={"thumb2" + item.personId}
                                  />
                                </div>
                                <div
                                  className="card-info"
                                  id={"cardInfo2" + item.personId}
                                >
                                  <div className="card-info-name">
                                    {item.name}
                                  </div>
                                </div>
                                <div className="card-features">
                                  <div
                                    className="card-features-button"
                                    onClick={() =>
                                      this.viewDetails(item.personId)
                                    }
                                  >
                                    View Details
                                  </div>
                                </div>
                                <div
                                  className="cardStyleHighlight"
                                  id={
                                    "cardStyle2" + item.personId + "Highlight"
                                  }
                                ></div>
                              </div>
                            </div>
                          </Fade>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>

                <Fade duration={500}>
                  <div className="detailsModal" id="detailsModal">
                    <div className="detailsModalScreen"></div>
                    <div className="detailsModalOuter">
                      <div
                        className="navbar-brand-in-details"
                        onClick={this.pageReload}
                      >
                        <FaCode size={isMobile ? "25px" : "30px"} className="brandIcon" />
                        CSE 2020
                      </div>
                      <div className="detailsModalCancelDiv">
                        <MdCancel
                          className="detailsModalCancel"
                          onClick={this.closeDetails}
                        />
                      </div>
                      <div
                        className="detailsModalInner detailsModalStudent"
                        id="detailsModalStudent"
                      >
                        <div className="detailsModalInnerExtra">
                          <div className="detailsModalInnerUltra">
                            <Fade delay={500} duration={500}>
                              <div>
                                <div className="detailsModalName">
                                  {this.state.detailsModalName}
                                </div>
                                <div className="detailsModalRno">
                                  {this.state.detailsModalRno}
                                </div>
                                <div>
                                  <MdCall className="modalIcon" />{" "}
                                  &nbsp;&nbsp;
                                  <a
                                    className="modalDetail modalHref modalPno"
                                    href={"tel:" + this.state.detailsModalPno}
                                  >
                                    {this.state.detailsModalPno}
                                  </a>
                                </div>
                                <div>
                                  <MdEmail className="modalIcon" />{" "}
                                  &nbsp;&nbsp;
                                  <a
                                    className="modalDetail modalHref"
                                    href={
                                      "mailto:" + this.state.detailsModalEmail
                                    }
                                  >
                                    {this.state.detailsModalEmail}
                                  </a>
                                </div>
                                <div>
                                  <MdHome className="modalIcon" />{" "}
                                  &nbsp;&nbsp;
                                  <span className="modalDetail">
                                    {this.state.detailsModalAddress}
                                  </span>
                                </div>
                              </div>
                            </Fade>
                          </div>
                        </div>
                      </div>
                      <div
                        className="detailsModalInner detailsModalStaff"
                        id="detailsModalStaff"
                      >
                        <div className="detailsModalInnerExtra">
                          <div className="detailsModalInnerUltra">
                            <Fade delay={500} duration={500}>
                              <div>
                                <div className="detailsModalName">
                                  {this.state.detailsModalName}
                                </div>
                                <div>
                                  <MdEmail className="modalIcon" />{" "}
                                  &nbsp;&nbsp;
                                  <a
                                    className="modalDetail modalHref"
                                    href={
                                      "mailto:" + this.state.detailsModalEmail
                                    }
                                  >
                                    {this.state.detailsModalEmail}
                                  </a>
                                </div>
                              </div>
                            </Fade>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Fade>

                <div className="max-widther" id="timelineStart">
                  <div className="picturesArea"></div>
                  <div className="timelineMain">
                    <div className="timeliner">
                      <div className="timelineContainer timelineLeft">
                        <Fade left>
                          <div className="timelineContent">
                            <div className="timelineHeader timelineFirst">
                              The Beginning
                            </div>
                            <p className="timelineMatter">
                              Regular Entry : July 7th 2016
                              <br />
                              Lateral Entry : July 2nd 2017
                            </p>
                          </div>
                        </Fade>
                      </div>
                      <div className="timelineContainer timelineRight">
                        <Fade right>
                          <div className="timelineContent">
                            <div className="timelineHeader">
                              68 Total Subjects
                              <span
                                tabIndex="0"
                                className="timelineInfo"
                                data-toggle="popover"
                                data-trigger="focus hover"
                                data-placement="auto"
                                title="Semester wise subject count"
                                data-html="true"
                                data-content="<p>
                                                <b>Semester 1 :</b> <i>7 Subjects, 2 Labs</i><br/>
                                                <b>Semester 2 :</b> <i>7 Subjects, 3 Labs</i><br/>
                                                <b>Semester 3 :</b> <i>6 Subjects, 3 Labs</i><br/>
                                                <b>Semester 4 :</b> <i>6 Subjects, 2 Labs</i><br/>
                                                <b>Semester 5 :</b> <i>6 Subjects, 3 Labs</i><br/>
                                                <b>Semester 6 :</b> <i>6 Subjects, 3 Labs, 1 Termpaper</i><br/>
                                                <b>Semester 7 :</b> <i>5 Subjects, 1 Lab, 1 Mini Project, 1 Internship</i><br/>
                                                <b>Semester 8 :</b> <i>3 Subjects, 1 Lab, 1 Major Project</i><br/>
                                              </p>"
                              >
                                <FiInfo className="FiInfoTimeline" />
                              </span>
                            </div>
                            <p className="timelineMatter">
                              46 Theory subjects
                              <br />
                              18 Labs
                              <br />
                              1 Termpaper
                              <br />
                              1 Mini Project
                              <br />
                              1 Internship
                              <br />1 Major Project
                            </p>
                          </div>
                        </Fade>
                      </div>
                      <div className="timelineContainer timelineLeft">
                        <Fade left>
                          <div className="timelineContent">
                            <div className="timelineHeader">
                              Structure
                            </div>
                            <p className="timelineMatter">
                              4 Years
                              <br />
                              8 Semesters
                              <br />
                              <i>Each semester :</i>
                              <br />
                              4 Internal Exams(2 Assignments, 2 Sessionals)
                              <br />1 Semester End Exams
                            </p>
                          </div>
                        </Fade>
                      </div>
                      <div className="timelineContainer timelineRight">
                        <Fade right>
                          <div className="timelineContent">
                            <div className="timelineHeader timelineEnd">
                              The End
                            </div>
                            <p className="timelineMatter">
                              We have the most unexpected ending. Corona Virus
                              became a major threat for the entire world and
                              the whole country has been locked down since
                              22nd March 2020, else we would've completed our
                              final exams by 11th April 2020. I'll update the
                              date of our graduation when things fall in
                              place.
                              <br />
                              <br />
                              <strong>Update : </strong>
                              Finally we completed our final exams on 18th Sep
                              2020. And the official date of leaving the
                              college is 30th Nov 2020 as per TC.
                            </p>
                          </div>
                        </Fade>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="max-widther midler">
                  <div className="endingQuote">The class of 2020</div>
                  <div className="totalVisits">
                    ~ This website is visited{" "}
                    <span className="visitsNumber">
                      {this.state.totalVisits}
                    </span>{" "}
                    times ~
                  </div>
                </div>
                <footer className="footer" id="footer">
                  <Fade>
                    <div>
                      <nav className="footer__nav shuffle shuffled">
                        <section className="footer__col footer__col--intro">
                          <div
                            className="navbar-brand"
                            onClick={this.pageReload}
                          >
                            <FaCode size="30px" className="brandIcon" />
                            CSE 2020
                          </div>
                          <p className="footer__slogan">
                            This app helps you
                            <strong>
                              {" "}
                              Find and reconnect with B.Tech classmates.
                            </strong>
                            <br />
                            This app will have your back when you wanna see
                            the pics of our classmates or reconnect with
                            them, providing you with their pictures and
                            contact details.
                            <br />
                            <strong>* </strong>
                            If Heroku and MongoDB doesn't remove their free
                            plans, this app will exist forever. And if i ever
                            update this app to a paid custom domain, i'll let
                            you guys know.
                            <br />
                          </p>
                        </section>
                        <section className="footer__col background--active">
                          <div className="footer__col-wrap">
                            <h4 className="footer__col-title">
                              Explore
                            </h4>
                            <div className="footer__nav-list">
                              <div
                                className="footer__link"
                                onClick={() => this.directPageShift("App")}
                              >
                                Home
                              </div>
                              <div
                                className="footer__link"
                                onClick={() =>
                                  this.directPageShift("timelineStart")
                                }
                              >
                                Timeline
                              </div>
                            </div>
                          </div>
                        </section>
                        <section className="footer__col">
                          <div className="footer__col-wrap">
                            <h4 className="footer__col-title">
                              Contact
                            </h4>
                            <a
                              href="mailto:vrsec2020@gmail.com"
                              className="footer__link"
                            >
                              vrsec2020@gmail.com
                            </a>
                            <a
                              href="tel:9493976733"
                              className="footer__link"
                            >
                              9493976733
                            </a>
                          </div>
                        </section>
                        <section className="footer__col footer__hide--large background--active">
                          <div className="footer__col-wrap">
                            <h4 className="footer__col-title">
                              Controls
                            </h4>
                            <div
                              onClick={() =>
                                this.setState({
                                  requestAdmin: true,
                                })
                              }
                              className="footer__link no-barba"
                            >
                              Admin
                            </div>
                          </div>
                        </section>
                        <small className="footer__legal">
                          <span
                            className="madeBy"
                            tabIndex="0"
                            data-toggle="popover"
                            data-trigger="focus hover"
                            data-placement="auto"
                            data-html="true"
                            data-content={`<img src = ${madeByImage} class = "madeByImageTag" alt = "Guna Chand"/>`}
                          >
                            Made With{" "}
                            <span className="madeByIcon">
                              <IoIosHeart />
                            </span>{" "}
                            By{" "}
                            <span className="madeByName">
                              Guna Chand Dakavarapu
                            </span>
                          </span>
                          <br />© 2020 CSE2020. All Rights Reserved.
                        </small>
                      </nav>
                    </div>
                  </Fade>
                </footer>
              </div>
            </div>
          );
        } else if (this.state.requestAdmin === true) {
          if (this.state.isAdmin === "YesYet") {
            if (this.state.confirmAdm === "nopeisyes") {
              return (
                <div id="App" className="App">
                  <Fade
                    top
                    duration={500}
                    when={this.state.showTimeoutMsgTrigger}
                  >
                    <div className="timeoutToast" id="timeoutToast">
                      {this.state.timeoutMsg}{" "}
                      <MdCancel
                        className="timeoutMsgCloserIcon"
                        title="Tap to close"
                        onClick={this.timeoutMsgCloser}
                      />
                    </div>
                  </Fade>
                  <div className="authForm max-widther">
                    <div className="authBordered">
                      <div className="authHead">Add/Update people</div>
                      <div className="authFormDiv">
                        <form
                          id="adminUploadForm"
                          onSubmit={this.uploadNewData}
                        >
                          <div className="custom-control custom-checkbox">
                            <input
                              type="checkbox"
                              id="updatePhoto"
                              name="updatePhoto"
                              className="custom-control-input"
                              value="updatePhoto"
                              onClick={this.updatePhotoInputChange}
                            />
                            <label
                              htmlFor="updatePhoto"
                              className="custom-control-label updatePhotoLabel"
                            >
                              Update only picture(Students Only)
                            </label>
                          </div>
                          <div
                            className="categoryInput"
                            id="categoryInputDiv"
                          >
                            <select
                              id="categoryInput"
                              className="authInputDropdown custom-select"
                              defaultValue="select"
                              onChange={this.handleCategoryInputChange}
                              required
                            >
                              <option
                                value="select"
                                style={{
                                  color: "gray",
                                }}
                                disabled
                              >
                                Select category
                              </option>
                              <option value="cse1">CSE 1</option>
                              <option value="cse2">CSE 2</option>
                              <option value="cse3">CSE 3</option>
                              <option value="staff">Staff</option>
                            </select>
                          </div>
                          <div id="rnoInputDiv">
                            <input
                              className="authInput"
                              id="rnoInput"
                              type="text"
                              placeholder="Enter roll number"
                              autoComplete="off"
                              required
                            />
                          </div>
                          <div id="nameInputDiv">
                            <input
                              className="authInput"
                              id="nameInput"
                              type="text"
                              placeholder="Enter the name"
                              autoComplete="off"
                              required
                            />
                          </div>
                          <div id="pnoInputDiv">
                            <input
                              className="authInput"
                              id="pnoInput"
                              type="text"
                              placeholder="Enter phone number"
                              autoComplete="off"
                              required
                            />
                          </div>
                          <div id="emailInputDiv">
                            <input
                              className="authInput"
                              id="emailInput"
                              type="email"
                              placeholder="Enter email"
                              autoComplete="off"
                              required
                            />
                          </div>
                          <div id="addressInputDiv">
                            <input
                              className="authInput"
                              id="addressInput"
                              type="text"
                              placeholder="Enter address"
                              autoComplete="off"
                              required
                            />
                          </div>
                          <div>
                            <input
                              className="authInput"
                              id="updateKeyInput"
                              type="password"
                              placeholder="Key to update"
                              autoComplete="off"
                              required
                            />
                          </div>
                          <div className="custom-file fileSelect">
                            <input
                              type="file"
                              className="custom-file-input fileSelectInput"
                              id="fileSelectInput"
                              required
                            />
                            <label
                              className="custom-file-label fileSelectLabel"
                              id="fileSelectLabel"
                              htmlFor="fileSelectInput"
                            >
                              Choose file...
                            </label>
                          </div>
                          <div className="tempImgDiv">
                            <div className="tempImgDivHead">Main</div>
                            <img
                              className="tempImg"
                              id="tempImg"
                              src=""
                              alt=""
                            />
                          </div>
                          <div
                            className="tempImgDiv tempImgThumb"
                            id="tempImgThumb"
                          >
                            <div className="tempImgDivHead">Thumbnail</div>
                            <img
                              className="tempImg"
                              id="tempImg2"
                              src=""
                              alt=""
                            />
                          </div>
                          <div className="authErrorDiv">&#160;</div>
                          <button
                            type="submit"
                            id="uploadButton"
                            className="authSubmit"
                          >
                            UPLOAD
                          </button>
                          <button
                            id="updatePictureButton"
                            className="authSubmit updatePictureButton"
                            onClick={this.updatePhoto}
                          >
                            UPDATE PICTURE
                          </button>
                        </form>
                        <button
                          className="authCancel"
                          onClick={() =>
                            this.setState({
                              requestAdmin: false,
                            })
                          }
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                    <div className="authBordered">
                      <div className="authHead">Change App Password</div>
                      <div className="authFormDiv">
                        <form
                          id="appPasswordForm"
                          onSubmit={this.appPasswordChange}
                        >
                          <div>
                            <input
                              className="authInput"
                              id="appPasswordInput"
                              type="text"
                              placeholder="Enter new password"
                              autoComplete="off"
                              required
                            />
                          </div>
                          <div>
                            <input
                              className="authInput"
                              id="appPasswordUpdateKeyInput"
                              type="password"
                              placeholder="Key to update"
                              autoComplete="off"
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            form="appPasswordForm"
                            className="authSubmit"
                          >
                            UPLOAD
                          </button>
                        </form>
                        <button
                          className="authCancel"
                          onClick={() =>
                            this.setState({
                              requestAdmin: false,
                            })
                          }
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                    <div className="authBordered">
                      <div className="authHead">Change Admin Password</div>
                      <div className="authFormDiv">
                        <form
                          id="adminPasswordForm"
                          onSubmit={this.adminPasswordChange}
                        >
                          <div>
                            <input
                              className="authInput"
                              id="adminPasswordInput"
                              type="text"
                              placeholder="Enter new password"
                              autoComplete="off"
                              required
                            />
                          </div>
                          <div>
                            <input
                              className="authInput"
                              id="adminPasswordUpdateKeyInput"
                              type="password"
                              placeholder="Key to update"
                              autoComplete="off"
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            form="adminPasswordForm"
                            className="authSubmit"
                          >
                            UPLOAD
                          </button>
                        </form>
                        <button
                          className="authCancel"
                          onClick={() =>
                            this.setState({
                              requestAdmin: false,
                            })
                          }
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div id="App" className="App">
                  <Fade
                    top
                    duration={500}
                    when={this.state.showTimeoutMsgTrigger}
                  >
                    <div className="timeoutToast" id="timeoutToast">
                      {this.state.timeoutMsg}{" "}
                      <MdCancel
                        className="timeoutMsgCloserIcon"
                        title="Tap to close"
                        onClick={this.timeoutMsgCloser}
                      />
                    </div>
                  </Fade>
                  <div className="authForm">
                    <div className="authContainer">
                      <div className="authHead">
                        Good try! But i know this loophole and patched it,
                        Sorry.
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          } else if (this.state.isAdmin === "NotYet") {
            return (
              <div id="App" className="App">
                <Fade
                  top
                  duration={500}
                  when={this.state.showTimeoutMsgTrigger}
                >
                  <div className="timeoutToast" id="timeoutToast">
                    {this.state.timeoutMsg}{" "}
                    <MdCancel
                      className="timeoutMsgCloserIcon"
                      title="Tap to close"
                      onClick={this.timeoutMsgCloser}
                    />
                  </div>
                </Fade>
                <div className="authForm max-widther">
                  <div className="authContainer">
                    <div className="authHead">Admin Authentication</div>
                    <div className="authFormDiv">
                      <form onSubmit={this.authenticateAdmin}>
                        <input
                          className="authInput"
                          id="adminInput"
                          type="password"
                          placeholder="Enter the key"
                          autoComplete="off"
                          required
                        />
                        <div className="authErrorDiv" id="adminErrorDiv">
                          &#160;
                        </div>
                        <button type="submit" className="authSubmit">
                          LOGIN
                        </button>
                      </form>
                      <button
                        className="authCancel"
                        onClick={() =>
                          this.setState({
                            requestAdmin: false,
                          })
                        }
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        }
      } else {
        return (
          <div id="App" className="App">
            <Fade top duration={500} when={this.state.showTimeoutMsgTrigger}>
              <div className="timeoutToast" id="timeoutToast">
                {this.state.timeoutMsg}{" "}
                <MdCancel
                  className="timeoutMsgCloserIcon"
                  title="Tap to close"
                  onClick={this.timeoutMsgCloser}
                />
              </div>
            </Fade>
            <div className="authForm">
              <div className="authContainer">
                <div className="authHead">
                  Good try! But i know this loophole and patched it, Sorry.
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
  }
}
export default App;
