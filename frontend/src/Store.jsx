import { useState } from "react"
import axios from "axios";
function Store(){
    const [text,setText]=useState("")
    const [file1,setFile1]=useState(null);
    const [file2,setFile2]=useState(null);
    const [file3,setFile3]=useState(null);
    const handleTextChange=(e)=>{
        setText(e.target.value)
    }
    const handleFile1Change=(e)=>{
        setFile1(e.target.files[0])
    }
    const handleFile2Change=(e)=>{
        setFile2(e.target.files[0])
    }
    const handleFile3Change=(e)=>{
        setFile3(e.target.files[0])
    }
    const handleSubmit=async ()=>{
        const requestData=new FormData()
        if(!text){
            alert("please enter atleast some text");
            return;
        }
        requestData.append('text',text)
        if(file1){
            requestData.append('files',file1)
        }
        if(file2){
            requestData.append('files',file2)
        }
        if(file3){
            requestData.append('files',file3)
        }
        console.log("i reached here")
        const {data} = await axios.post('http://localhost:8000',requestData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
)
alert(data.createdStore.keyword)
}
    return(
        <>
            <div className="store-container">
                <div className="left">
                    <textarea className="text" placeholder="Enter your text here..." onChange={handleTextChange} value={text}></textarea>
                </div>
                <div className="right">
                    <p>Upload or drag and drop files here (Max 3 files)</p>
                    <input type="file" onChange={handleFile1Change}/>
                    <input type="file" onChange={handleFile2Change}/>
                    <input type="file" onChange={handleFile3Change} />
                    <button onClick={handleSubmit}>Save and generate key</button>
                </div>
            </div>
        </>
    )
}
export {
    Store
}