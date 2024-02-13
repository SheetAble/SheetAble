<p align="center">
<img src="https://img.shields.io/github/forks/SheetAble/SheetAble?color=bf616a&labelColor=3b4252&style=for-the-badge"> <img src="https://img.shields.io/github/stars/SheetAble/SheetAble?color=d08770&labelColor=3b4252&style=for-the-badge"> <img src="https://img.shields.io/github/issues-raw/SheetAble/SheetAble?color=a3be8c&labelColor=3b4252&style=for-the-badge"> <a href="./LICENSE"> <img src="https://img.shields.io/static/v1?label=license&message=AGPL&color=81a1c1&labelColor=3b4252&style=for-the-badge"> </a>
<a href="https://discord.com/invite/QnFbxyPbRj"> <img src="https://img.shields.io/static/v1?label=discord&message=Join&color=5765F2&labelColor=3b4252&style=for-the-badge"> </a>
</p>
<br />
<p align="center">
  <a href="https://github.com/SheetAble">
    <img src="docs/LogoT.png" alt="Logo" width="110" height="110">
  </a>

  <h3 align="center">SheetAble</h3>

  <p align="center">
    Self-hosted music sheet organizing software
    <br />
    <a href="https://sheetable.net" target="_blank"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://discord.com/invite/QnFbxyPbRj" target="_blank">Discord Server</a>
    ·
    <a href="https://github.com/SheetAble/SheetAble/issues">Report Bug</a>
    ·
    <a href="https://github.com/SheetAble/SheetAble/issues">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
		<a href="#getting-started">Getting Started</a>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
    <li><a href="#supporters">Supporters</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

<img src="docs/SheetAbleShowcase.gif" alt="Example Gif" style="border-radius: 5px;">

**SheetAble** is an easy-to-use music sheet organizer for all the music enthusiasts out there. You can upload and organize your sheets for any kind of instrument you use!
Create Accounts for your friends or family to invite them to your library to use it as well or potentially upload sheets themselves.
Currently it is available for web and [iPad/Android Tablets](https://github.com/SheetAble/tablet-client). All repos are open-source with the `AGPL` license.

You may also suggest changes by forking this repo and creating a [pull request](https://github.com/SheetAble/SheetAble/compare) or opening an [issue](https://github.com/SheetAble/SheetAble/issues). Thanks to all the people who want to help expanding this project!

### Built With

The backend is written in [Golang](https://golang.org/) and the frontend with [React.js](https://reactjs.org/). In addition, this project utilizes [Docker](https://docs.docker.com/) for simple and easy containerization and [Node](https://nodejs.org/en) to take advantage of the processing power of the users computer instead of the browser. These two applications improve the projects development cycle and user experience. 

<!-- GETTING STARTED -->

## Getting Started

### Production Version

To install the **production** version of SheetAble please refer to this [Docs page](https://sheetable.net/docs/Installation/installation).

### Development Version

To develop on SheetAble we also made a [Documentation guide](https://sheetable.net/docs/development).

<!-- ROADMAP -->

## Roadmap

See the [open issues](https://github.com/SheetAble/SheetAble/issues) for a list of proposed features (and known issues).

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

As a prerequisite for contributions, please ensure that your system has the correct versions of **Node.js** and **GoLang**.

- GoLang v1.6
- Node v14

To confirm that you have the necessary versions on your development environment, you can use the following commands within your terminal:
- `node -v`
- `go version`

### Typical Contribution Steps

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a [Pull Request](https://github.com/SheetAble/SheetAble/compare)

## Project Anatomy
### Backend
The [backend](https://github.com/SheetAble/SheetAble/tree/main/backend) directory containes the following:
- `backend\api\auth` - Manages the creation and validation of user tokens
- `backend\api\config` - Manages the configuration of the development environment and database
- `backend\api\controllers` - Manages the logic of the application without being tied to the frontend
- `backend\api\forms` - Determines the structure of data whenever a form is accessed or requested
- `backend\api\middlewares` - Manages the setup of existing middleware in the project
- `backend\api\models` - Houses the models for different data, said models include props and attributes according to reactjs
- `backend\api\seed` - Attempts to upload user data
- `backend\api\utils` - General function utilities are stored here

### Frontend
The [frontend](https://github.com/SheetAble/SheetAble/tree/main/frontend) directory contains the following: 
- `frontend\src\components` - User interface definitions
- `frontend\src\images` - Contains images and animations used on the application
- `frontend\src\redux` - Manages react states
- `frontend\src\utils` - General function utilities are stored here
  
<!-- LICENSE -->

## License

Distributed under the AGPL License. See `LICENSE` for more information.

<!-- CONTACT -->

## Contact

Valentin Zwerschke - [@vallezw](https://github.com/vallezw)

Organization Link: [github.com/SheetAble](https://github.com/SheetAble)

<!-- ACKNOWLEDGEMENTS -->

## Acknowledgements

- [Open Opus API](https://openopus.org) - Free, open metadata for classical music
