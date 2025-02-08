import { GoogleLogout} from 'react-google-login'

const clientId = "85931472280-3ocbkq4j94e2r1usv6k6q9hrdrqbmdes.apps.googleusercontent.com"

function Logout() {

    const onSuccess = () => {
        console.log("Logout success");
    }

    return(
        <div id="signOutButton">
            <GoogleLogout
                clientId={clientId}
                buttonText="Logout"
                onLogoutSuccess={onSuccess}
            />
        </div>
    )
}

export default Logout;