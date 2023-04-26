import React, { useState } from 'react';
import axios from 'axios';
import urls from "../utils/constants/urls";

const Test = () => {
    const [file, setFile] = useState(null);
    const returnData = () => {
        return axios
            .get(urls.IMAGE_BASE_URL, { params: { imageKey: "images/content/fd3fd690-85bb-11eb-9d6d-c1928bb106f5" } })
            .then((result) => {
                return fetch(result.data.image);
            })
            .then(res => res.blob())
            .then((result) => {
                const file = new File([result], "Thumbnail.jpeg", {
                    type: result.type
                });
                setFile(URL.createObjectURL(file));
            });
    }

    return (
        <div>
            <button onClick={returnData} >Return Data</button>
            <img id="target" src={file} />
        </div>

    )
}

export default Test;