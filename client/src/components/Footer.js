import React from "react";

function Footer() {
    return (
        <footer id="footer">
            <a className="footerGit" href="https://github.com/DirtySandals/SandalBotV2"><i class="fa-brands fa-github"></i></a>
            <a className="footerLichess" href="https://lichess.org/@/SandalBot"><img src="lichess.svg"></img></a>
            <div className="footerText">
                <p>A project by Aleksander Gayko</p>
                <p>© SandalBot. All rights reserved.</p>
            </div>
        </footer>
    )
}

export default Footer;