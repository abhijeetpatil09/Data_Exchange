import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from '@mui/material';
import * as actions from "../../redux/actions/index";

// import "./pure-react.css";
// import "./styles.css";
import AWS from "aws-sdk";

const Register = () => {
  //const blob = new Blob([data.Body.toString()], { type: 'text/csv' });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [attributes, setAttributes] = useState("");

  const s3 = new AWS.S3({
    accessKeyId: "AKIA57AGVWXYVR36XIEC",
    secretAccessKey: "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",
    // signatureVersion: 'v4',
    region: "ap-south-1",
    // region: 'ap-south-1',
  });

  const params = {
    // Bucket: 'dcr-poc/query_request',
    Bucket: "dcr-poc",
    Key: "consumer_attributes/consumer_attributes.csv",
    //Body: blob,
    // ACL: 'private',
  };

  // s3.listBuckets(function(err, data) {
  //     if (err) console.log(err, err.stack);
  //     else console.log(data);
  // });
  //const consumer_attr = s3.getObject(params).promise();
  //console.log(consumer_attr)
  s3.getObject(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      //console.log(data.Body.toString('utf-8'));
      console.log(data.Body.toString("utf-8").split("\n"));
      //const attr = data.Body.toString('utf-8').split("\n");
      //const attr2 = attr.toString('utf-8').split(",");
      //console.log(attr.toString('utf-8'));
      //alert('file downloaded successfully')
    }
  });

  useEffect(() => {
    // axios
    //   .get("http://127.0.0.1:5000/data_fetcher", {
    //     params: {
    //       query:
    //         "select * from DCR_PROVIDER1.CLEANROOM.CONSUMER_ATTRIBUTES_VW;",
    //     },
    //   })
    //   .then((response) => setData(response.data.data))
    //   .catch((error) => console.log(error));
  }, []);

  const errors = {
    uname: "invalid username",
    pass: "invalid password",
  };

  const handleSubmit = (event) => {
    setLoading(true);
    //Prevent page reload
    event.preventDefault();

    axios
      .get("http://127.0.0.1:5000/data_fetcher", {
        params: {
          query:
            "select * from DCR_PROVIDER1.CLEANROOM.CONSUMER_ATTRIBUTES_VW;",
        },
      })
      .then((response) => {
        if (response?.data?.data) {
          let data = response?.data?.data;

          // Find user login info
          const userData = data.find((user) => user.USER === userName);

          // Compare user info
          if (userData) {
            if (userData.PASSWORD !== password) {
              // Invalid password
              setErrorMessages({ name: "pass", message: errors.pass });
            } else {
              const userRole = [];
              if (userData.PUBLISHER === "TRUE") {
                userRole.push("Publisher");
              }
              if (userData.PROVIDER === "TRUE") {
                userRole.push("Provider");
              }
              if (userData.CONSUMER === "TRUE") {
                userRole.push("Consumer");
              }
              setIsSubmitted(true);

              dispatch(
                actions.loginRequest({
                  name: userName,
                  role: userRole,
                })
              );
              toast.success('Logged in sucessfully...');
              navigate("/home");
            }
          } else {
            // Username not found
            setLoading(false);
            setErrorMessages({ name: "uname", message: errors.uname });
            toast.error('You entered an incorrect username, password or both.');
          }
        }
      })
      .catch((error) => {
        setLoading(false);
        console.log(error)
      });

    fetch("http://localhost:5000/upload", {
      method: "GET",
    })
      .then((response) => {
        setAttributes(response.status_code);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Generate JSX code for error message
  const renderErrorMessage = (name) =>
    name === errorMessages.name && (
      <div className="error">{errorMessages.message}</div>
    );

  // JSX code for login form
  const renderForm = (
    <div className="space-y-6">
      <div>
        <label htmlFor="uname" className="block text-sm font-medium leading-6 text-gray-900">Username </label>
        <div className="mt-2">
          <input
            id="uname"
            type="text"
            name="uname"
            placeholder="Please enter a username. e.g. aditi_nair"
            onChange={(e) => setUserName(e.target.value)}
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-deep-navy sm:text-sm sm:leading-6"
          />
        </div>
        {renderErrorMessage("uname")}
      </div>
      <div>
        <label htmlFor="pass" className="block text-sm font-medium leading-6 text-gray-900">
          Password
        </label>
        <div className="mt-2">

          <input
            id="pass"
            type="password"
            name="pass"
            placeholder="Please enter your password."
            required
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-deep-navy sm:text-sm sm:leading-6"
          />
        </div>
        {renderErrorMessage("pass")}
      </div>
      <div>
        <label htmlFor="pass" className="block text-sm font-medium leading-6 text-gray-900">
          Confirm Password
        </label>
        <div className="mt-2">

          <input
            id="pass"
            type="password"
            name="pass"
            placeholder="Please enter your password again."
            required
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-deep-navy sm:text-sm sm:leading-6"
          />
        </div>
        {renderErrorMessage("pass")}
      </div>
      <div>
        <button 
          onClick={handleSubmit}
          className="flex w-full justify-center rounded-md bg-electric-green px-3 py-1.5 text-sm font-semibold leading-6 text-deep-navy shadow-sm hover:bg-true-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-green"
          >
          {loading ? <CircularProgress style={{ width: '24px', height: '24px', color: '#FFFFFF' }} /> : "Submit"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-full flex-1 flex-col justify-start px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-semibold  leading-9 tracking-tight text-deep-navy">
          Sign in to your account
        </h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {isSubmitted ? (
          <div>User is successfully logged in</div>
        ) : (
          renderForm
        )}
      </div>

    </div>
  );
}

export default Register;

  // const database = [
  //   {
  //     username: "admin",
  //     password: "admin",
  //     role:["Consumer","Publisher","Provider"]
  //   },
  //   {
  //     username: "provider",
  //     password: "provider",
  //     role:["Consumer","Provider"]
  //   },
  //   {
  //     username: "Hoonartek",
  //     password: "Hoonartek",
  //     role:["Consumer","Publisher"]
  //   },
  //   {
  //     username: "HTmedia",
  //     password: "HTmedia",
  //     role:["Consumer"]
  //   }
  // ];