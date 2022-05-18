require('dotenv').config();
const express = require('express');
const Figma = require('figma-api');
// const axios = require('axios');
const cors = require('cors');
const router = require('./routes/index');
const errorHandler = require('./middleware/ErrorHandlingMiddleware');
const fetch = require("isomorphic-fetch");


const PORT = process.env.PORT || 5000
const app = express();


async function figmaFileFetch(fileId, token) {

    const versions = await fetch('https://api.figma.com/v1/files/' + fileId + '/versions', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
        }
    })

    let versionsArr = await versions.json()

    let versionsIdList = versionsArr.versions.map(function (version) {
        return version.id
    })

    const versionDateList = versionsArr.versions.map(function (version) {
        return ({
            "version": version.id,
            "created": version.created_at,
            "label": version.label,
            "user": version.user
        })
    })

    function getFileVersionById(versionId, fileId) {
        return fetch('https://api.figma.com/v1/files/' + fileId + '?version=' + versionId, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
            }
        })
    }

    async function getAllVersionsComponentsJSON(versionsIdList, fileId) {
        let versions = Promise.all(versionsIdList.map(versionId => getFileVersionById(versionId, fileId)));
        let versionsJSON = await Promise.all((await versions).map(res => res.json()))
        const versions2 = versionsJSON.map(vers => getComponentsFromVersion(vers));

        Object.fromEntries(componentsMap(versions2, versionsIdList))
        return [Object.fromEntries(componentsMap(versions2, versionsIdList)), versionDateList, token, fileId]

    }


    return getAllVersionsComponentsJSON(versionsIdList, fileId)


    function getComponentsFromVersion(version) {
        const components = [];

        function filterComponents(node) {
            if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
                components.push(node);
            }

            if (node.children && node.children.length > 0) {
                node.children.forEach(grandchild => filterComponents(grandchild));
            }

        }

        filterComponents(version.document);

        return components;
    }


    function componentsMap(versions, versionIdList) {
        const map = new Map();
        versions.forEach((version, versionId) => version.forEach(component => {
            const componentVersions = map.get(component.id) || {};
            map.set(component.id, { ...componentVersions, [versionIdList[versionId]]: component});
        }));
        //console.log(map);
        return map;
    };
}

app.use(cors());
app.use(express.json());
app.use('/api', router);
app.use('/api/info/file', async function (req, res) {
    const token = '' + req.query.token
    const link = '' + req.query.link
    let result = await figmaFileFetch(link, token).catch(error => console.log(error))
    res.json(result)
})

// Обработка ошибок
app.use(errorHandler);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));