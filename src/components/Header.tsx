import { AppBar, Toolbar, Link } from "@mui/material"
import GitHubIcon from '@mui/icons-material/GitHub';


import Logo from "./Logo"
function Header() {
  return (
    <AppBar position="static" sx={{
      backgroundColor: "transparent",
      marginBottom: 5,
      boxShadow: 0
    }}>
      <Toolbar>
        <Logo />
        <Link href="https://github.com" color="#EEE">
          <GitHubIcon />
        </Link>
      </Toolbar>
    </AppBar>
  )
}

export default Header