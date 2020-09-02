import React, {Component} from 'react'

class FileUpload extends Component{
  constructor(){
    super()
    this.state = {
      uploadValue: 0
    }
  }
  render (){
    return(
      <div>
        <progress value={this.state.uploadValue} max='100'>
          {this.state.uploadValue} %
        </progress>
        <br/>
        <i className="fa fa-camera" aria-hidden="true"></i>
        <input type="file" onChange = { this.props.onUpload }/>

      </div>
    )
  }
}
export default FileUpload
