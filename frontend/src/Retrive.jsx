import { useState } from "react"
function Retrieve({keyword}){
    const [key,setKey]=useState("")
    function handleKeywordChange(e){
        setKey(e.target.value)
    }
    const contactServer=()=>{
        
    }
    return (
        keyword?
        <>
        <p>hello</p>
        </>:
        <>
   
    <div className="keyword">
      <label>shareme.me/</label><input type="text" onChange={handleKeywordChange} value={key} />
    </div>
    <button className="get" onClick={contactServer}>
      GET
    </button>
        </>
        
    )
}
export{
    Retrieve
}