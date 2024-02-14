import React,{Component} from "react";
import { View,
         Text,
         StyleSheet,
         Image,
         Platform, 
         StatusBar,
         SafeAreaView, 
         FlatList } from "react-native";
import {initializeApp} from "firebase/app";
import { firebaseConfig} from "../config";

const app =  initializeApp(firebaseConfig);
const auth = getAuth(app);

import CardPost from "./CardPost";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {onValue, ref as refDatabase} from 'firebase/database';
import { database } from "../config";
import { Alert } from "react-native";


//Necesito una página de creditos
//<a href="https://www.flaticon.es/iconos-gratis/electronica" title="electrónica iconos">Electrónica iconos creados por Muhammad Ali - Flaticon</a>

const posts = require("./temp_posts.json");

export default class Feed extends Component{
    constructor(props){
        super(props);
        this.state ={
            horizontalGrid: true,
            lightTheme: true
        }
    }

    componentDidMount(){
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
        if (user) {

            gridRef = refDatabase(database, 'users/' + user.uid + '/posts');
            onValue(gridRef, (snapshot)=>{
                this.setState({
                    horizontalGrid: snapshot.val() == 'horizontal' ? true : false
                });
            })

            themeRef =  refDatabase(database, 'users/' + user.uid + '/theme');
            onValue(themeRef, (data)=>{
                this.setState({
                    lightTheme: data.val() === 'light' ? true : false 
                })
            }) 
        } else {
            Alert.alert('Usuario Desleoguedo')
        }
        });

    }

    keyExtractor = (item, index) => index.toString();

    renderizado = ({item:post}) => {
        return(
            <CardPost post={post} navigation={this.props.navigation}/>
        );
    }

    
    render(){
        const {lightTheme, horizontalGrid} = this.state
        return(
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
                <View styles={styles.postContainer}>
                    <FlatList
                        data={posts}
                        renderItem={this.renderizado}
                        keyExtractor={this.keyExtractor}
                        horizontal={this.state.horizontalGrid}
                    />
                </View>
                
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor: "#F9F4FC"
    },
    containerDark:{
        flex: 1,
        backgroundColor: '#000024'
    },
    droidSafeArea: {
        marginTop: Platform.OS === "android" ? StatusBar.currentHeight : RFValue(35)
    },
    titleContainer:{
        flex: 0.3,
        flexDirection: 'row'
    },
    titleImageContainer:{
        flex: 0.4,
        resizeMode: 'stretch',
        height:50,
        width:50
    },
    titleTextContainer:{
        flex:0.8
    },
    titleText:{
        fontWeight: 'bold',
        textAlign: 'left',
        fontSize: 35,
    },
    titleTextDark:{
        fontWeight: 'bold',
        textAlign: 'left',
        fontSize: 35,
        color: 'white'
    },
    iconImage: { 
        width: "100%",
        height: "100%",
        resizeMode: "contain"
    },
    postContainer:{
        flex:1
    }
})

