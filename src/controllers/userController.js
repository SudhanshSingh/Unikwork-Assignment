const userModel = require("../models/userModel");
const validator = require("../validators/validations");
const { uploadFile } = require("../aws/uploadImage");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 10;

const register = async function (req, res) {
  try {
    const body = req.body;
   // console.log(body,"1")
    const profileImage = req.files;
     //console.log(profileImage,"profileImg")

    const { fname, lname, email, phone, address } = body;
    let password = body.password;
    const { shipping, billing } = address;

    // <--------reqBody validation----------------->
    if (!validator.isValidBody(body))
      return res
        .status(400)
        .send({ status: false, message: "Provide details inside body" });

    // <---------Fname validation---------------->
    if (!fname)
      return res
        .status(400)
        .send({ status: false, message: "fname is required" });
    if (!/^[A-Za-z]{2,15}$/.test(fname.trim()))
      return res
        .status(400)
        .send({ status: false, message: "fname not valid" });

    // <--------lname validation---------------->
    if (!lname)
      return res
        .status(400)
        .send({ status: false, message: "lname is required" });
    if (!/^[A-Za-z]{2,15}$/.test(lname.trim()))
      return res
        .status(400)
        .send({ status: false, message: "lname not valid" });

    // <--------email validation---------------->
    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "email is required" });
    if (!validator.isValidEmail(email))
      return res
        .status(400)
        .send({ status: false, message: "Enter valid email" });

    // <--------Check Email is Exist in db or not-------------->
    const uniqueEmail = await userModel.findOne({ email });
    if (uniqueEmail)
      return res
        .status(409)
        .send({ status: false, message: "email is already exist" });

    // <--------profile image validation & upload on the aws server------------->
    if (profileImage.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "ProfileImage is required" });

        console.log('hii')

    if (profileImage && profileImage.length > 0) {
      if (
        profileImage[0].mimetype == "image/jpg" ||
        profileImage[0].mimetype == "image/png" ||
        profileImage[0].mimetype == "image/jpeg"
      ) {
        console.log('hii',2)
        const uploadImage = await uploadFile(profileImage[0]);
        console.log('hii',3)
        body["profileImage"] = uploadImage;
      } else
        return res
          .status(400)
          .send({
            status: false,
            message: "Profile image should be in jpg, jpeg or png format !!",
          });
    }
    console.log('hii',4)
    // <----------Phone validation-------------->
    if (!phone)
      return res
        .status(400)
        .send({ status: false, message: "phone is required" });
    if (!validator.isValidMobile(phone))
      return res
        .status(400)
        .send({ status: false, message: "phone is not in the valid formate" });

    // <-----------Check phone number is exist in db or not-------------->
    const uniquePhone = await userModel.findOne({ phone });
    if (uniquePhone)
      return res
        .status(409)
        .send({ status: false, message: "phone is already exist" });

    // <---------Password validation & encrpt that---------->
    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "password is required" });
    if (!validator.isValidPassword(password))
      return res
        .status(400)
        .send({
          status: false,
          message: "password is not in the valid formate",
        });
    let encryptPassword = await bcrypt.hash(password , saltRounds);
    console.log(encryptPassword,"encryptPassword")

    body["password"] = encryptPassword;

    // <-------address body validation----------->
    if (!validator.isValidBody(address))
      return res
        .status(400)
        .send({ status: false, message: "address is required" });

    // <-----------shipping body validation------------->
    if (!validator.isValidBody(shipping))
      return res
        .status(400)
        .send({ status: false, message: "shipping is required" });

    // <----------shipping street validation----------->
    if (!validator.isValid(shipping.street))
      return res
        .status(400)
        .send({ status: false, message: "shipping street is required" });

    // <-----------Shipping city validation----------->
    if (!validator.isValid(shipping.city))
      return res
        .status(400)
        .send({ status: false, message: "shipping city is required" });

    // <-----------Shipping pincode validation----------->
    if (!validator.isValidNumber(parseInt(shipping.pincode)))
      return res
        .status(400)
        .send({ status: false, message: "shipping pincode should be number" });
    if (!validator.isValidPincode(shipping.pincode))
      return res
        .status(400)
        .send({ status: false, message: "shipping pincode is Invalid !!" });

    // <-----------billing body validation------------->
    if (!validator.isValidBody(billing))
      return res
        .status(400)
        .send({ status: false, message: "billing is required" });

    // <----------billing street validation----------->
    if (!validator.isValid(billing.street))
      return res
        .status(400)
        .send({ status: false, message: "billing street is required" });

    // <-----------billing city validation----------->
    if (!validator.isValid(billing.city))
      return res
        .status(400)
        .send({ status: false, message: "billing city is required" });

    // <-----------billing pincode validation----------->
    if (!validator.isValidNumber(parseInt(billing.pincode)))
      return res
        .status(400)
        .send({ status: false, message: "billing pincode should bhe number" });
    if (!validator.isValidPincode(billing.pincode))
      return res
        .status(400)
        .send({ status: false, message: "billing pincode is Invalid !!" });
       console.log(body,"2")

       
    // <----------Create a document of user---------->
    const data =  await userModel.create(body);
    return res
      .status(201)
      .send({ status: true, message: "Success", data: data });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};




// <-------------------logIn------------------------->




const login = async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!validator.isValidBody(req.body))
      return res
        .status(400)
        .send({ status: false, message: "req body is invalid !!" });

    // <--------email validation---------------->
    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "email is required" });
    if (!validator.isValidEmail(email))
      return res
        .status(400)
        .send({ status: false, message: "Enter valid email" });

    const data = await userModel.findOne({ email });
    console.log(data)
    if (!data)
      return res
        .status(401)
        .send({ status: false, message: "email id is incorrect !" });
    // <--------password validation---------------->
    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "password is required" });
    const decryptPassword = await bcrypt.compare(password, data.password);
    if (!decryptPassword)
      return res
        .status(401)
        .send({ status: false, message: "password is incorrect" });

    // <-------generate JWT Token and valid for 100 Minutes--------------->
    let payload = {
      userId: data._id,
      role:data.role,
      exp: Math.floor(Date.now() / 1000) + 24*60 * 60,
      iat: Math.floor(Date.now() / 1000),
    };
    let token = jwt.sign(payload, "Unikwork");
    //   res.setHeader("x-api-key", token);
    res.status(200).send({
      status: true,
      message: "user logged in successfully",
      data: {
        token,
        userId: data._id,
        role:data.role,
        exp: payload.exp,
        iat: payload.iat,
      },
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};



module.exports = { register, login };
