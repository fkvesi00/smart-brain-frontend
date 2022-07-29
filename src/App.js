import React,{ Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particle from './components/Particle/Particle'

import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';

import './App.css';



const initialState={
    input:'',
    imageUrl:'',
    box:{},
    route:'SignIn',
    isSingedIn:false,
    user:{
      id:'',
      name:'',
      email:'',
      entries: 0,
      joined: ''
    }
}
class App extends Component{  
  constructor(){
    super();
    this.state=initialState;
  }

  loadUser = (data) =>{
    this.setState({user:{
      id:data.id,
      name:data.name,
      email:data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }
  
  calculateFaceLocation=(data)=>{
    const clarifaiFace=data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage');
    const width= Number(image.width);
    const height= Number(image.height);
    return{
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height-(clarifaiFace.bottom_row * height)
    }
  }
  
  displayFaceBox = (box) =>{
    this.setState({box:box})
  }
 
  onInputChange=(event)=>{
    this.setState({input:event.target.value})
    console.log(event.target.value);
  }
 
  onSubmit=()=>{
    this.setState({imageUrl:this.state.input});
    fetch('https://git.heroku.com/moj-server.git/image',{
        method:'post',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
        input:this.state.user.input
        })
      })
      .then(response => response.json())
    .then(response => 
      { 
        if(response){
          fetch('https://git.heroku.com/moj-server.git/image',{
            method:'put',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
            id:this.state.user.id
        })
          })
          .then(response=>response.json())
          .then(count=>{
            this.setState(Object.assign(this.state.user,{entries:count}))
          })
          .catch(console.log);
        }
        this.displayFaceBox(this.calculateFaceLocation(response))})
    .catch(err=>console.log(err));
  }

  onRouteChange=(route)=>{
    if(route==='signOut'){
      this.setState(initialState)
    }else if(route==='home'){
      this.setState({isSingedIn:true})
    }
    this.setState({route:route});
  }
  
  render(){
    const {isSingedIn,imageUrl,route,box}=this.state;
    return (
      <div className='App'>
         <Particle className='particles'/>
         <Navigation isSignedIn={isSingedIn} onRouteChange={this.onRouteChange}/>
         {route==='home'?
         <div>
         <Logo />
         <Rank name={this.state.user.name} entries={this.state.user.entries}/>
         <ImageLinkForm 
         onInputChange={this.onInputChange} 
         onSubmit={this.onSubmit}
         />
        <FaceRecognition imageUrl={imageUrl} box={box} />
        </div>
        :(
          route==='SignIn'?
          <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          :
          <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        )
      }
        </div>
    );
  }
}



export default App;
