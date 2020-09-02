import React, {Component} from 'react';
import firebase from 'firebase';

import './App.css';
import FileUpload from './FileUpload'

class App extends Component{
  constructor(){
    super()
    // el state lo creamos para verificar y al macenar los datos del usuario
    this.state = {
      user: null,
      pictures: [],
      nuevo:''
    }
    //es necesario utilizar el metodo bind para los metodos que creamos, asi le espesificamos a react donde pertenecen
    this.handleAuth = this.handleAuth.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }
  //este metodo es un ciclo de vida que nos proporciona firebase
//  componentWillMount(){ <----- ese metodo esta obsoleto por que no es seguro
  componentDidMount() {
    // Cada vez que el método 'onAuthStateChanged' se dispara, recibe un objeto (user)
    // Lo que hacemos es actualizar el estado con el contenido de ese objeto.
    // Si el usuario se ha autenticado, el objeto tiene información.
    // Si no, el usuario es 'null'
    firebase.auth().onAuthStateChanged(user => {
      this.setState({
        user:user
      })
    })
    firebase.database().ref('pictures').on('child_added', snapshot => {
      //modificamos el estado
     this.setState({
       pictures: this.state.pictures.concat(snapshot.val())
     });
   });
  }
  handleAuth(){
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
    .then(result => console.log(`${result.user.email} ha iniciado sesión`))
    .catch(error => console.log(`Error ${error.code}: ${error.nessage}`))
  }
  handleLogout(){
    firebase.auth().signOut()
    .then(result => console.log(`${result.user.email} ha salido`))
    .catch(error => console.log(`Error ${error.code}: ${error.nessage}`))
  }
  handleUpload (event){
    const file = event.target.files[0];
    const storageRef = firebase.storage().ref(`fotos/${file.name}`);
    const task = storageRef.put(file);
    let upTask ="123"
    // Listener que se ocupa del estado de la carga del fichero
   task.on('state_changed', snapshot => {
     // Calculamos el porcentaje de tamaño transferido y actualizamos
     // el estado del componente con el valor
     let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

     this.setState({
       uploadValue: percentage
     })
     task.snapshot.ref.getDownloadURL().then(function(downloadURL){
        //tengo que guardar la variable downloadURL
        //y mandalo a record en image
        upTask = downloadURL.toString()
        console.log("desntro", upTask)
     })
   }, error => {
     // Ocurre un error
     console.error(error.message);
   }, () => {
     // Subida completada
     // Obtenemos la URL del fichero almacenado en Firebase storage
     // Obtenemos la referencia a nuestra base de datos 'pictures'
     // Creamos un nuevo registro en ella
     // Guardamos la URL del enlace en la DB

     this.setState({
       nuevo: upTask
     })

     console.log('display name: ',this.state.user.displayName);
     console.log('task',upTask)
     const record = {
       displayName: this.state.user.displayName,
       image: this.state.nuevo,
       photoURL: this.state.user.photoURL
     }
     console.log('valor de nuevo state',this.state.nuevo)
     //lo almacenamos en la base de datos
     const dbRef = firebase.database().ref('pictures');
     //anadimos el nuevo registro de la imagen
     const newPicture = dbRef.push();//nos creara ya con un id
     newPicture.set(record);

   });
  }

  renderLoginButton(){
    // si el usuario está logueado
    if (!this.state.user) {
      return (
        <div>
          <header className="App-header">
            <h2>InstaGram</h2>
          </header>
          <h5 className="aviso">Para empezar a usar la App Web de InstaGram es necesario logearte con tu cuenta de google</h5>
          <button onClick={this.handleAuth} className="App-btn">
            <span className="fa fa-google"></span> Iniciar sesión con Google
          </button>
        </div>
      );
    } else  {
      return (
        <div>
          <header className="App-header space-between">
            <i className="fa fa-camera" aria-hidden="true"></i>
            <h2>InstaGram</h2>
            <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
          </header>
          <div className="App-intro">
            {
              this.state.pictures.map((picture, index) => (
                <div className="App-card" key={index}>
                  <figure className="App-card-image">
                    <div className="App-card-footer">
                      <img className="App-card-avatar" src={picture.photoURL} alt={picture.displayName} />
                      <span className="App-card-name">{picture.displayName}</span>
                    </div>
                    <img src={picture.image} alt=""/>
                    <div className="header-bar space-between">
                      <div>
                        <i className="fa fa-heart-o" aria-hidden="true"></i>
                        <i className="fa fa-comment-o" aria-hidden="true"></i>
                        <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
                      </div>
                      <div>
                        <i className="fa fa-bookmark-o" aria-hidden="true"></i>
                      </div>
                    </div>
                    <div className="App-card-footer">
                      <p className="App-card-text">!Playera ideal para este verano caluroso! </p>
                    </div>
                  </figure>
                </div>
              )).reverse()
            }
            <div className="App-header space-between">
              <img width="38" src={this.state.user.photoURL} alt={ this.state.user.displayName }/>
              <p className="App-intro">¡{ this.state.user.displayName }!</p>
              <button onClick={this.handleLogout} className="App-btn"><i className="fa fa-sign-out" aria-hidden="true"></i></button>
            </div>
            <FileUpload onUpload={ this.handleUpload }/>
          </div>
        </div>
      );
    }
  }
  render(){
    return (
      <div className="App">
        {this.renderLoginButton()}
      </div>
    );
  }
}

export default App;
