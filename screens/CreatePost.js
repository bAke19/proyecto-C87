import React,{Component} from "react";
import { View, 
         Text,
         Image,
         Button, 
         StyleSheet, 
         TouchableOpacity,
         SafeAreaView,
         StatusBar,
         ScrollView,
         TextInput,
         KeyboardAvoidingView, 
         Alert} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { Camera, CameraType} from 'expo-camera';
import { RFValue } from "react-native-responsive-fontsize";

import {onAuthStateChanged} from "firebase/auth";
import { storage, authPerfil, database} from "../config";
import {ref, uploadBytes} from "firebase/storage"
import {onValue, ref as refDatabase} from 'firebase/database';

export default class CreatePost extends Component{
    constructor(props){
        super(props);
        this.cameraRef = null;
        this.state = {
            permission: false,
            cameraType: CameraType.back,
            image: null,
            imageURL : null,
            imageHeight: 0,
            title: '',
            description: '',
            uid: '',
            lightTheme: true,
        }
    }

    componentDidMount(){
      onAuthStateChanged(authPerfil, (user)=>{
        this.setState({
          uid: user.uid
        })

        let themeRef =  refDatabase(database, 'users/' + user.uid + '/theme');
        onValue(themeRef, (data)=>{
            this.setState({
                lightTheme: data.val() === 'light' ? true : false 
            })
        }) 
      })
    }

    getGranted = async () => {
        const status = await Camera.requestCameraPermissionsAsync();

        if(status.granted){
            //return this.setState({permission: true});
            return this.takePicture()
        }else{
            return await Camera.requestCameraPermissionsAsync()
        }
        
    }

    pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          quality: 1,
        });

        console.log(result.assets[0].fileName)
        var newImageHeight = result.assets[0].height/5
    
        if (!result.canceled) {
          this.setState({
            imageURL: result.assets[0].uri, 
            imageHeight: newImageHeight < 500 ? newImageHeight : 450
          });
        }
        
        
      };

    takePicture = async () => {  
      const cameraResponse = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality:1
      })

      var newPhotoHeight = cameraResponse.assets[0].height/5;

      if(!cameraResponse.canceled){
        this.setState({
          imageURL: cameraResponse.assets[0].uri, 
          imageHeight: newPhotoHeight < 500 ? newPhotoHeight : 450
        });
      }

    };

    uploadImage = async (file) =>{

      var date = new Date().toString()

      const fetchRequest = await fetch(file);
      const theblob = await fetchRequest.blob()
      const imageRef =  ref(storage, this.state.uid +'/' + date);

      uploadBytes(imageRef, theblob).then((snapshot) => {
        console.log('Uploaded a blob or file!');
      })
      .catch(error=> Alert.alert(error));
    }

    render(){
      const {lightTheme} = this.state
            return (
              <View style={lightTheme ? styles.container : styles.containerDark}>
                <SafeAreaView style={styles.droidSafeArea} />
                <View style={styles.titleContainer}>
                    <View style={styles.titleImageContainer}>
                        <Image
                            style={styles.iconImage}
                            source={require("../assets/camara1.png")}
                        />
                    </View>
                    <View style={styles.titleTextContainer}>
                        <Text style={lightTheme ? styles.titleText : styles.titleTextDark}>
                            Spectagram
                        </Text>
                    </View>
                </View>
                <ScrollView>
                  <Image source={{ uri: this.state.imageURL }} style={!this.state.imageURL ? {height:20}: [styles.imageSelected, {height: this.state.imageHeight}]} />
                  <View style={styles.twoColums}>
                    <TouchableOpacity 
                      style={lightTheme ? styles.buttons : styles.buttonsDark}
                      onPress={() => {this.getGranted()}}>
                      <Text
                        style={lightTheme ? styles.textButtons : styles.textButtonsDark}>
                        Tomar Foto
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={lightTheme ? styles.buttons : styles.buttonsDark}
                      onPress={() =>{this.pickImage()}}>
                      <Text
                        style={lightTheme ? styles.textButtons : styles.textButtonsDark}>
                        Galeria
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <KeyboardAvoidingView>
                    <TextInput
                      style={lightTheme ? [styles.buttons,styles.inputs] : [styles.buttons,styles.inputsDarks]}
                      onChangeText={text => this.setState({title: text})}
                      placeholder="  Titulo"
                      maxLength={100}
                      placeholderTextColor={lightTheme ? 'black' : 'white'}
                      />
                    <TextInput
                      style={lightTheme ? [styles.buttons,styles.inputs] : [styles.buttons,styles.inputsDarks]}
                      onChangeText={text => this.setState({description: text})}
                      placeholder="  Descripción"
                      placeholderTextColor={lightTheme ? 'black' : 'white'}
                      multiline={true}
                      numberOfLines={4}
                      maxLength={200}
                      />
                  </KeyboardAvoidingView>
                </ScrollView>
                <TouchableOpacity 
                  onPress={()=> this.uploadImage(this.state.imageURL)}
                  style={lightTheme ? styles.uploadButton : styles.uploadButtonDark}>
                  <Text style={lightTheme ? styles.textButtonsDark : styles.textButtons}>
                    Crear Publicación
                  </Text>
                </TouchableOpacity>
                
              </View>
            );        
    }
}
const styles = StyleSheet.create({
    container: {
        flex:1
    },
    containerDark: {
      flex:1,
      backgroundColor: '#000024'
    },
    camera: {
      flex: 0.8,
      justifyContent: 'center',
      width:'100%'
    },
    buttonContainer: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: 'transparent',
      margin: 64,
      alignItems: 'center'
    },
    button: {
      flex: 1,
      alignSelf: 'flex-end',
      alignItems: 'center',
    },
    text: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    textDark: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'black',
    },
    droidSafeArea: {
      marginTop: Platform.OS === "android" ? StatusBar.currentHeight : RFValue(35)
    },
    titleContainer:{
        flexDirection: 'row'
    },
    titleImageContainer:{
        flex: 0.4,
        resizeMode: 'stretch',
        height:50,
        width:50
    },
    titleTextContainer:{
        flex:1
    },
    titleText:{
        fontWeight: 'bold',
        textAlign: 'left',
        fontSize: 35
    },
    titleTextDark:{
      fontWeight: 'bold',
      textAlign: 'left',
      fontSize: 35,
      color: 'white',
    },
    iconImage: { 
        width: "100%",
        height: "100%",
        resizeMode: "contain"
    },
    imageSelected:{
      width: '90%',
      borderRadius: 30,
      alignSelf: 'center',
      marginTop: 30,
      marginBottom: 30
    },
    twoColums:{
      flexDirection: 'row',
      justifyContent: 'space-around'
    },
    buttons:{
      borderRadius: 15,
      borderWidth: 2,
      width:'45%',
      paddingTop: 10,
      paddingBottom: 10,
      justifyContent: 'center',
    },
    buttonsDark:{
      borderRadius: 15,
      borderWidth: 2,
      width:'45%',
      paddingTop: 10,
      paddingBottom: 10,
      justifyContent: 'center',
      borderColor: 'white'
    },
    textButtons:{
      fontSize:RFValue(15),
      alignSelf: 'center'
    },
    textButtonsDark:{
      fontSize:RFValue(15),
      alignSelf: 'center',
      color: 'white'
    },
    inputs:{
      width: '95%', 
      alignSelf: 'center',
      marginTop: 20
    },
    inputsDarks:{
      width: '95%', 
      alignSelf: 'center',
      marginTop: 20,
      borderColor: 'white',
    },
    uploadButton:{
      width: '95%', 
      alignSelf: 'center',
      padding: 10,
      borderRadius: 15,
      backgroundColor: 'black'
    },
    uploadButtonDark:{
      width: '95%', 
      alignSelf: 'center',
      padding: 10,
      borderRadius: 15,
      backgroundColor: 'white'
    }
    
  });
  