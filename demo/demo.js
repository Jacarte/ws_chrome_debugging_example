function a(){
    b();
}

function b(){
    console.log("I am b")
}



setTimeout(() => {
    eval("b()")
}, 1000)