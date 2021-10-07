# NOI Maps

[![REUSE status](https://api.reuse.software/badge/github.com/noi-techpark/webcomp-maps-noi)](https://api.reuse.software/info/github.com/noi-techpark/webcomp-maps-noi)

NOI Techpark map web application to search places and see an overview of the NOI Techpark area.

- [NOI Maps](#noi-maps)
  - [Usage](#usage)
    - [Attributes](#attributes)
      - [lang](#lang)
      - [totem](#totem)
      - [fullview](#fullview)
  - [Getting started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Source code](#source-code)
    - [Dependencies](#dependencies)
    - [Build / Test](#build--test)
  - [Deployment](#deployment)
  - [Deployment server prerequisites](#deployment-server-prerequisites)
  - [Folders](#folders)
  - [Docker environment](#docker-environment)
    - [Installation](#installation)
    - [Dependenices](#dependenices)
    - [Start and stop the containers](#start-and-stop-the-containers)
    - [Running commands inside the container](#running-commands-inside-the-container)
  - [Edit-SVGs](#edit-svgs)
    - [Floorplans](#floorplans)
    - [Icons](#icons)
  - [Information](#information)
    - [Support](#support)
    - [Contributing](#contributing)
    - [Documentation](#documentation)
    - [Boilerplate](#boilerplate)
    - [License](#license)

## Usage

Web component script file `dist/noi_maps_widget.min.js`:

```html
<map-view language="it" totem="0"></map-view>
```

### Attributes

#### lang

Webcomponent main language

Type: string
Options: "it", "de", "en"

#### totem

Optional. Ability to turn off (0) or on (1) the totem functionalities (e.g. for
Pepper Robot) with QR Code sharing

Type: Int
Options: "0", "1"

#### fullview

Optional. Ability to turn off (0) or on (1) the fullview display (no header, no cookies, no footer)

Type: Int
Options: "0", "1"


## Getting started

These instructions will get you a copy of the project up and running
on your local machine for development and testing purposes.

### Prerequisites

To build the project, the following prerequisites must be met:

* Node.js https://nodejs.org/

For a ready to use Docker environment with all prerequisites already installed
and prepared, you can check out the [Docker environment](#docker-environment)
section.

### Source code

Get a copy of the repository:

```bash
git clone https://github.com/noi-techpark/webcomp-maps-noi.git
```

Change directory:

```bash
cd webcomp-maps-noi/
```

### Dependencies

Download all dependencies:

```bash
npm install
```

### Build / Test

Build and start the project:

```bash
npm run start
```

The application will be served and can be accessed at
[http://localhost:8080](http://localhost:8080).


## Deployment

To create the distributable files, execute the following command:

```bash
npm run build
```

## Deployment server prerequisites

The server that hosts the image resources (svg, jpg, ...) must allow
cross-origin domain request. You can use an .htaccess file like:

```html
<FilesMatch "\.(svg)$">
	<IfModule mod_headers.c>
		Header set Access-Control-Allow-Origin "*"
	</IfModule>
</FilesMatch>
```

## Folders
* dist - compiled and distributable file (*npm run build*)
* node_modules - installed node modules (*npm install*)
* work - production (*npm start*)

## Docker environment

For the project a Docker environment is already prepared and ready to use with
all necessary prerequisites.

These Docker containers are the same as used by the continuous integration
servers.

### Installation

Install [Docker](https://docs.docker.com/install/) (with Docker Compose) locally
on your machine.

### Dependenices

First, install all dependencies:

```bash
docker-compose run --rm app /bin/bash -c "npm install"
```

### Start and stop the containers

Before start working you have to start the Docker containers:

```
docker-compose up --build --detach
```

After finished working you can stop the Docker containers:

```
docker-compose stop
```

### Running commands inside the container

When the containers are running, you can execute any command inside the
environment. Just replace the dots `...` in the following example with the
command you wish to execute:

```bash
docker-compose run --rm app /bin/bash -c "..."
```

Some examples are:

```bash
docker-compose run --rm app /bin/bash -c "npm run test"
```

## Edit-SVGs

These steps illustrate how to change the floorplans and icons svg using Adobe
Illustrator.

### Floorplans

* download the desired svg (e.g.
  https://stage.madeincima.it/noi-maps-svg-test/floors/a2-1.svg )
* open the svg with Adobe Illustrator
* in the "Levels" tab you'll find all the clickable rooms named after the
  `Beacon ID` code found in the Google Sheet **wrapped inside a group**

    #### Naming convention
    * beacon_id: `A2 1.10`
    illustrator level's name: `A2-1-10` *(building A2 , floor 1, room 10)*

    * beacon_id: `A2 1.10.C`
    illustrator level's name: `A2-1-10-C` *(building A2 , floor 1, room 10C)*

    * beacon_id: `A2-1.20`
    illustrator level's name: `A2--1-20` *(building A2 , floor -1, room 20)*

    * beacon_id: `A2-1.20.B`
    illustrator level's name: `A2--1-20-B` *(building A2 , floor -1, room 20B)*

    #### To summarize

    * **every dot (`.`) and every space (` `) must be replaced with a minus symbol (`-`)**
    `A2 1.10.C` -> `A2-1-10-C`

    * **every minus symbol (`-`) [negative floors] must be replaced with a double minus symbol (`--`)**
    `A2-1.20.B` -> `A1--1-20-B`

* edit the SVG as you like
* if you've added a clickable room **remember to wrap it in a group named after
  the naming convention accordingly with the beacon_id on the Google Sheet**
* Export the file using
    * File > Export > Export as
    * do NOT rename the file (leave the original file name)

    * #### SVG export options
        * **Styling**: Inline style
        * **Font**: SVG
        * **Image**: Embed
        * **Objects IDs**: Layer names
        * **Decimal**: 2
        * **Minify**: checked
        * **Responsive**: checked
* upload the SVG

### Icons
* just edit the desidered SVG and then re-upload it
* if possibile, use squared designs


## Information

### Support

For support, please contact [help@opendatahub.bz.it](mailto:help@opendatahub.bz.it).

### Contributing

If you'd like to contribute, please follow the following instructions:

- Fork the repository.

- Checkout a topic branch from the `development` branch.

- Make sure the tests are passing.

- Create a pull request against the `development` branch.

A more detailed description can be found here:
[https://github.com/noi-techpark/documentation/blob/master/contributors.md](https://github.com/noi-techpark/documentation/blob/master/contributors.md).

### Documentation

More documentation can be found at
[https://opendatahub.readthedocs.io/en/latest/index.html](https://opendatahub.readthedocs.io/en/latest/index.html).

### Boilerplate

The project uses this boilerplate:
[https://github.com/noi-techpark/webcomp-boilerplate](https://github.com/noi-techpark/webcomp-boilerplate).

### License

The code in this project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE
Version 3 license. See the [LICENSE.md](LICENSE.md) file for more information.


