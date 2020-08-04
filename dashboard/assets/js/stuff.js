function changeGuild(id) {
    document.getElementById('iFrameGuild').src = `/dashboard/${id}`
}

function invite(botID, guildID, domain, port) {
    window.location.replace(`https://discordapp.com/oauth2/authorize?client_id=${botID}&scope=bot&permissions=8&guild_id=${guildID}&response_type=code&redirect_uri=${encodeURIComponent(`${domain}${port == 80 ? "" : `:${port}`}/callback`)}`);
}