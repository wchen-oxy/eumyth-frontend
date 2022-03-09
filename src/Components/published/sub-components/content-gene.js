import React, { useState } from 'react';
import './content-gene.scss'
const ANCESTORS = "ANCESTORS";
const CHILDREN = "CHILDREN";

const ContentGenes = (props) => {
    const [toggleState, setToggleState] = useState(false);
    const getToggleInfo = () => {
        setToggleState(!toggleState)
    }
    const content = props.contentType === ANCESTORS ? props.ancestors : props.children;

    return (
        <div>
            {props.contentType === ANCESTORS && <p>Total Ancestors: {props.ancestors.length}</p>}
            {props.contentType === CHILDREN && <p>Total Children: {props.children.length}</p>}
            {props.contentType === ANCESTORS &&
                <button onClick={getToggleInfo}>
                    {toggleState ? "Hide Ancestors" : "Show Ancestors"}

                </button>}{
                props.contentType === CHILDREN &&
                <button onClick={getToggleInfo}>
                    {toggleState ? "Hide Children" : "Show Children"}
                </button>}
            {toggleState && content.length > 0 ?
                content.map(
                    (info, index) => {
                        if (props.contentType !== CHILDREN & index === 0)
                            return (
                                <a href={"/c/" + info._id} target="_blank" rel='noreferrer'>
                                    <div className='contentgene-container'>
                                        <h4>Original: {info.title}</h4>
                                        <p>{info.remix}</p>
                                    </div>
                                </a>
                            )
                        else {
                            return (
                                <a href={"/c/" + info._id} target="_blank" rel='noreferrer'>
                                    <div className='contentgene-container'>
                                        <h4>{index + 1}. {info.title}</h4>
                                        <p>{info.remix}</p>
                                    </div>
                                </a>
                            )
                        }
                    }
                )
                : null
            }
        </div>
    )


}

export default ContentGenes;