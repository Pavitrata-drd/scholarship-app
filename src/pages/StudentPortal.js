import React from "react";
import "../styles/StudentPortal.css";

function StudentPortal(){

return(

<div className="portal-container">

<div className="portal-header">

<h2>Students</h2>

<div className="portal-tabs">

<button className="active">Login</button>
<button>Register</button>
<button>Know your OTR</button>
<button>FAQs</button>
<button>Grievance</button>

</div>

</div>


<div className="portal-body">

{/* LEFT SIDE */}

<div className="portal-left">

<h3>Application Login</h3>

<p>New user? Register yourself</p>

<label>Aadhaar No *</label>

<div className="aadhaar-box">

<input placeholder="Enter Aadhaar Number"/>
<button>Get OTP</button>

</div>


<label>Enter OTP *</label>

<div className="otp-box">

<input/>
<input/>
<input/>
<input/>
<input/>
<input/>

</div>


<label>Captcha</label>

<div className="captcha-box">

<div className="captcha">YESZ3L</div>

<input placeholder="Enter Captcha"/>

</div>


<button className="proceed-btn">Proceed</button>

</div>


{/* RIGHT SIDE */}

<div className="portal-right">

<h3>Student Login Tips</h3>

<ul>

<li>Read instructions carefully</li>
<li>Fill correct details</li>
<li>Incorrect info may lead to rejection</li>
<li>Keep password secure</li>
<li>Check application before submit</li>

</ul>

</div>


</div>

</div>

);

}

export default StudentPortal;
