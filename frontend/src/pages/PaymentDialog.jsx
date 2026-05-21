const pay = async(plan)=>{

const res = await axios.post("/payment/create",{plan})

const options = {

key:"RAZORPAY_KEY",

amount:res.data.amount,

currency:"USD",

name:"CyberSec Hub",

description:"Breach Intelligence",

order_id:res.data.id,

handler:function(){

alert("Payment Successful")

}

}

const rzp = new window.Razorpay(options)

rzp.open()

}