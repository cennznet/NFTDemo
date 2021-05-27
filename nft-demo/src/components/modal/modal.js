import './modal.css';
import '../../App.css';
import React, {Component} from 'react';

class Modal extends Component {

    componentDidMount() {
        // Get the modal and btn elements
        const modal = document.getElementById("myModal");
        const btn = document.getElementById(this.props.btnId);
        const span = document.getElementsByClassName("close")[0];

        btn.onclick = function() {
            modal.style.display = "block";
        }

        span.onclick = function() {
            modal.style.display = "none";
        }

        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        }
    }

    render() {
        return (
            <div id="myModal" className="modal">
                <div className="modal-content">
                    <span className="close">&times;</span>
                    <h2  className="neonText" >{this.props.title}</h2>
                    <div className="modal-form">
                        <label className="neonText">
                            Enter IPFS url:
                            <input type="text" onChange={(event) =>{this.props.nftAttributeHandler(event.target.value)}} />
                        </label>
                        <label className="neonText" >
                            Enter Token owner address:
                            <input type="text" onChange={(event) =>{this.props.tokenOwnerHandler(event.target.value)}} />
                        </label>
                        <label className="neonText" >
                            Enter Token name:
                            <input type="text" onChange={(event) =>{this.props.tokenOwnerNameHandler(event.target.value)}} />
                        </label>
                        <button className="modal-button"
                                onClick={() =>{
                                    document.getElementById("myModal").style.display = "none";
                                    this.props.addTokenHandler()
                                }}
                        >Add</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Modal;