function openSideBar() {
    const sideBar = document.querySelector( ".sidebar" );
    if ( !sideBar ) return;
    sideBar.style.width = "500px";
    sideBar.style.transform = "skewY(0deg)";
    const closeBtn = document.querySelector( ".close" );
    closeBtn.style.display = "block";
}

function closeSideBar ()
{
    const sideBar = document.querySelector( ".sidebar" );
    if ( !sideBar ) return;
    sideBar.style.width = "0";
    sideBar.style.transform = "skewY(-90deg) ";
        const closeBtn = document.querySelector(".close");
    setTimeout( () =>
    {
        closeBtn.style.display = "none";
            console.log("hi");
    }, 1000 );

}