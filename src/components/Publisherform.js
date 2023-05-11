import React, { useState } from 'react'
import AWS from 'aws-sdk';
import myBackgroundImage from '../Assets/DCR-background.png';
// import nodemailer from 'nodemailer';
import JSZip from 'jszip';
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";

import "./styles.css";
import "./pure-react.css";

const timestamp = Date.now();
const dateObj = new Date(timestamp);

const year = dateObj.getFullYear();
const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
const day = dateObj.getDate().toString().padStart(2, '0');
const hours = dateObj.getHours().toString().padStart(2, '0');
const minutes = dateObj.getMinutes().toString().padStart(2, '0');
const seconds = dateObj.getSeconds().toString().padStart(2, '0');

const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
console.log(formattedDate); 





const Publisherform = () => {
    const user = useSelector(selectUser)
    console.log(user);
    console.log(user['name']);

    const initialState = {
    
        Query_Name: '',
        Provider_Name: user['name'],
        Column_Names: '',
        Consumer_Name: user['name'],
        RunId: formattedDate,
        File_Name: '',
        Match_Attribute: '',
    }
    console.log(user['name']);
    const [formData, setFormData] = useState(initialState)
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [csvData, setCsvData] = useState(['-','-','-']);
    const [requestId, setRequestId] = useState('-')
    const [disableButton, setDisableButton] = useState(false);
    const [gender, setGender] = useState('male');



   

    const handleCustomerFormData = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value, RunId : Date.now() })
        console.log(formData)   
    }

    const handleFileInput = (event) => {

        event.preventDefault()
        var fileInput = document.getElementById("myFileInput");
        var file = fileInput.files[0];
        console.log(file.name)
        setFormData({ ...formData, File_Name: file.name, RunId : Date.now() })
        console.log(formData)
    }

    const handleSelectChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions).map((option) => option.value);
        const delimiter = '&';
        const selectedOptionsString = `#${selectedOptions.join(delimiter)}#`;
        setFormData({ ...formData, [event.target.name]: selectedOptionsString, RunId : Date.now() })
        console.log(formData)
        // setSelectedColumns(selectedOptions);
    };

    function isValidInput(inputString) {
        const regex = /^[0-9][0-9,-]*[0-9]$/; // regex pattern to match only comma, hyphen, and numeric values and start and end with numeric values
        return regex.test(inputString); // returns true if inputString matches the regex pattern, false otherwise
    }

    const [inputValue, setInputValue] = useState('');
    const [inputError, setInputError] = useState(null);

    function handleInputChange(event) {
        const newValue = event.target.value;
        if (isValidInput(newValue)) {
            console.log('valid Input')
            setInputValue(newValue); 
            setInputError(null);
        } else {
          setInputError('Input must contain only comma, hyphen, and numeric values and start and end with a numeric value');
          console.log('invalid Input')
        }
    }

    const sendEmail = () => {

        // create reusable transporter object using the default SMTP transport
        // let transporter = nodemailer.createTransport({
        //     host: 'smtp.gmail.com',
        //     port: 465,
        //     secure: true, // true for 465, false for other ports
        //     auth: {
        //         user: 'atulkhot07@gmail.com', // your email address
        //         pass: '9975334797' // your email password or app password if using 2-factor authentication
        //     }
        // });

        // // setup email data with unicode symbols
        // let mailOptions = {
        //     from: '"Atul Khot" atulkhot07@gmail.com', // sender address
        //     to: 'atulkhot07@example.com', // list of receivers
        //     subject: 'Hello', // Subject line
        //     text: 'Hello world?', // plain text body
        //     // html: '<b>Hello world?</b>' // html body
        // };

        // // send mail with defined transport object
        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         return console.log(error);
        //     }
        //     console.log('Message sent: %s', info.messageId);
        // });
        console.log('into send email method')

    }

    

    const handleSubmit = (event) => {
        
        setRequestId(formData['RunId'])
        event.preventDefault();
        
            setDisableButton(true);

            setTimeout(() => {
            setDisableButton(false);
            }, 110000);

            console.log(formData)
            
            setFormData({ ...formData, RunId : Date.now() })
            console.log(formData)
            const keys = Object.keys(formData);
            let csv = keys.join(',') + '\n';
            for (const obj of [formData]) {
                const values = keys.map(key => obj[key]);
                csv += values.join(',') + '\n';
            }


            console.log(csv)
            const blob = new Blob([csv], { type: 'text/csv' });
            const file1 = new File([blob], formData['Query_Name'] + '_' + formData['RunId'] +".csv", { type: 'text/csv' })
            // const url = URL.createObjectURL(blob);
            // const link = document.createElement('a');
            // link.href = url;
            // link.download = formData['RunId'] +'.csv';
            // document.body.appendChild(link);
            // link.click();

            const s3 = new AWS.S3({
            accessKeyId: 'AKIA57AGVWXYVR36XIEC',
            secretAccessKey: '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',
            // signatureVersion: 'v4',
            region: 'ap-south-1',
            // region: 'ap-south-1',
            });
        
            const params = {
            // Bucket: 'dcr-poc/query_request',
            Bucket: 'dcr-poc',
            Key: 'query_request/' + formData['Query_Name'] + '_' + formData['RunId'] +".csv",
            Body: blob,
            // ACL: 'private',
            };


            s3.putObject(params, (err, data) => {
                if (err) {
                console.log(err);
                } else {
                console.log(`File uploaded successfully. ETag: ${data.ETag}`);
                }
            });

            var inputFile = document.getElementById("myFileInput");

            const params2 = {
                // Bucket: 'dcr-poc/query_request',
                Bucket: 'dcr-poc',
                Key: 'query_request_data/' + inputFile.files[0].name,
                Body: inputFile.files[0],
                // ACL: 'private',
            };

            s3.putObject(params2, (err, data) => {
                if (err) {
                console.log(err);
                } else {
                console.log(`File uploaded successfully. ETag: ${data.ETag}`);
                setCsvData(['-','-','-'])
                }
            });


            const formData2 = new FormData();
            formData2.append('file', inputFile.files[0]);
        
            fetch('http://localhost:5000/upload', {
              method: 'POST',
              body: formData2,
            })
              .then((response) => {
                console.log(response);
              })
              .catch((error) => {
                console.error(error);
              });

            const formData3 = new FormData();
            formData3.append('file', file1);
        
            fetch('http://localhost:4040/upload2', {
            method: 'POST',
            body: formData3,
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });

            const fetchCsvData = async (key) => {
                try {
                const data = await s3.getObject({
                    Bucket: 'dcr-poc',
                    Key: 'query_result_tables/'+formData['RunId'] + '/'+ key,
                }).promise();
                
                
                setCsvData(data.Body.toString('utf-8').split('\n')[1].split(','));
                console.log(data.Body.toString('utf-8').split('\n')[1].split(','))
                console.log(csvData)
                
                } catch (err) {
                console.error(err);
                }
            };

            
                fetchCsvData(formData['Query_Name']+'_'+formData['RunId']+'.csv');
            
           

    } 
    
    return (
        <div className="home">
            <form name = 'myForm' onSubmit={handleSubmit}>
                <br></br>
                <div style={{ boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', padding: '10px', width: '500px', height: '390px', margin: 'auto', backgroundColor: '#f0f9ff' }}>
                    <h2 style={{textAlign: 'center'}}>Advertiser Record Match</h2>
                    <br></br>
                    <div className="input-container">
                        <label>
                            Query Name &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;
                            <select name = "Query_Name" style={{marginLeft:'10px'}} onChange={handleCustomerFormData} required className='my-select'>
                                <option value="">--Select--</option>
                                <option value="advertiser_match">Advertiser Match</option>
                            </select>
                        </label>
                    </div>
                    
                    <div className="input-container">
                        <label>
                            Upload File &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;
                            <input className='my-select' style={{marginLeft:'11px'}} type="file" id="myFileInput" onChange={handleFileInput} required />
                        </label>
                    </div>
                    
                    <div className="input-container">
                        <label>
                            Identifier Type &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;
                            <select name = "Column_Names" style={{marginLeft:'12px'}} onChange={handleCustomerFormData} required className='my-select'>
                                <option value="">--Select--</option>
                                <option value="emailid">Email</option>
                                <option value="phone">Phone</option>
                                <option value="MAID">MAID-WIP</option>
                            </select>
                        </label>
                    </div>
                    
                    <div className="input-container">
                        <label>
                            Match Attribute &nbsp;&nbsp;&nbsp;:&nbsp;
                            <select name = "Match_Attribute" style={{marginLeft:'11px'}} onChange={handleCustomerFormData} required className='my-select'>
                                <option value="">--Select--</option>
                                <option value="overall">Overall</option>
                                <option value="age">Age</option>
                                <option value="gender">Gender</option>
                                <option value="phone">Phone</option>
                            </select>
                        </label>
                        {formData['Match_Attribute'] === 'gender' &&
                        <div>
                            Select Gender &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;
                            <label>
                                <input
                                type="radio"
                                value="male"
                                checked={gender === 'male'}
                                onChange={(e) => setGender(e.target.value)}
                                />
                                Male
                            </label>
                            <label>
                                <input
                                type="radio"
                                value="female"
                                checked={gender === 'female'}
                                onChange={(e) => setGender(e.target.value)}
                                />
                                Female
                            </label>
                        </div>}
                        {formData['Match_Attribute'] === 'age' &&
                        <div>
                            <label>
                                Enter Age &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;
                                <input type='text' onChange={handleInputChange}  style={{marginLeft:'11px'}} required className='my-select'></input>
                                <div style={{fontSize: '13px', marginLeft: '140px'}}>* Please enter comma seperated values eg: 25,14,30,28</div>
                                {inputError && <div style={{fontSize: '13px', marginLeft: '140px', color: 'red'}}>{inputError}</div>}
                            </label>
                        </div>}
                        {formData['Match_Attribute'] === 'phone' &&
                        <div>
                            <label>
                                Phone No &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;
                                <input type='text' style={{marginLeft:'11px'}} required className='my-select'></input>
                            </label>
                        </div>}
                    </div>
                    <br></br>
                    <input style={{marginLeft: '160px'}} type="submit" value="Submit Query Request" />
                </div>                
            </form>
            <div className='homecenter'>
                <h4 style={{marginLeft : '130px'}}>Output Console:</h4>
                
                <table style={{marginLeft : '130px', marginBottom : '10px'}}>
                    <thead>
                    <tr>
                        <th>Request ID</th>
                        <th>Advertiser Records Count</th>
                        <th>Record Match</th>
                        <th>Percentage Match</th>
                        <th>Run Ad. Campaign</th>
                    </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{requestId}</td>
                            <td>{csvData[0]}</td>
                            <td>{csvData[1]}</td>
                            <td>{csvData[2]}</td>
                            <td><button onClick={() => sendEmail()}>Push to FB-WIP</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Publisherform
