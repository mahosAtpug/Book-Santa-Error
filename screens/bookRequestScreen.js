import React from "react";
import {TouchableOpacity , Text , Image , StyleSheet , View, TextInput, Alert , Modal, TouchableHighlight , ScrollView , KeyboardAvoidingView } from "react-native"
import db from "../config"
import firebase from "firebase"
import MyHeader from "../component/myHeader"
import {BookSearch} from "react-native-google-books"
import { FlatList } from "react-native-gesture-handler";

export default class BookRequestScreen extends React.Component{

    constructor(){
        super()
        this.state={
            userId:firebase.auth().currentUser.email,
            bookName:"",
            reasonToRequest:"",
            requestId:"",
            bookStatus:"",
            requestedBookName:"",
            docId:"",
            isBookRequestStatusActive:"",
            showFlatList:false,
            dataSource:""
        }
    }

    createUniqueId(){
        return Math.random().toString(36).substring(7);
    }

    async getBooksFromAPI(bookName){
        this.setState({
            bookName:bookName

        })
        if (bookName.length > 2){
            var books = await BookSearch.searchbook(bookName , "AIzaSyD7AQpIkWHir7FP-z4gJR5nnPoExDd8lt4")
            this.setState({
                dataSource:books.data , 
                showFlatList  : true
            })
        }
    }

    addRequest = async()=>{
        var randomRequestId  = this.createUniqueId()
        var books = await BookSearch.searchbook(bookName , "AIzaSyD7AQpIkWHir7FP-z4gJR5nnPoExDd8lt4")

        db.collection("requested_books").add({
            user_id:this.state.userId,
            book_name:this.state.bookName,
            reason_to_request:this.state.reasonToRequest,
            request_id:randomRequestId,
            book_status:"Requested",
            image_link:books.data[0].volumeInfo.imageLinks.smallThumbnail
        })
        await this.getBookRequest()
        db.collection("users").where("email_id" , "==" , this.state.userId).get()
        .then()
        .then((snapshot)=>{
           snapshot.forEach((doc)=>{
              db.collection("users").doc(doc.id).update({
                  isBookRequestStatusActive:true
              })
           }) 
        })

        this.setState({
            bookName:"",
            reasonToRequest:""
        })

        return Alert.alert("Book Request sent Successfully")
        alert("Book Request Sent Successfully")
    }

    getIsBookRequestStatusActive (){
        db.collection("users").where("email_id" , "==" , this.state.userId)
        .onSnapshot((snapshot)=>{
            snapshot.forEach((doc)=>{
                this.setState({
                    isBookRequestStatusActive: doc.data().isBookRequestStatusActive,
                    docId:doc.id
                })
            })
        })
    }

    getBookRequest=()=>{
        var bookRequest = db.collection("requested_books").where("user_id" , "==" , this.state.userId)
        .get()
        .then((snapshot)=>{
           snapshot.forEach((doc)=>{
               if (doc.data().book_status !== "recieved"){
                   this.setState({
                       requestId:doc.data().request_id,
                       requestedBookName : doc.data().book_name,
                       bookStatus : doc.data().book_status,
                       docId: doc.id
                   })
               }
           })
        }) 
    }

    renderItem = ({item , i})=>{
        return(
            <TouchableHighlight style={{alignItems:"center" , backgroundColor:"#DDDDDD" , padding:10 , width:"90%"}} 
                                activeOpacity={0.6} underlayColor={"#DDDDDD"} onPress={()=>{
                                    this.setState({
                                        showFlatList: false,
                                        bookName : item.volumeInfo.title
                                    })
                                }} bottomDivider>

                 <Text>

                  {item.volumeInfo.title}

                </Text>                   
                 
            </TouchableHighlight>
        )
    }

    componentDidMount (){
        this.getIsBookRequestStatusActive()
    }
    updateBookRequestStatus = ()=>{
        db.collection("requested_books").doc(this.state.docId).update({
            book_status:"recieved"
        })
        db.collection("users").where("email_id" , "==" , this.state.userId).get()
        .then((snapshot)=>{
            snapshot.forEach((doc)=>{
                db.collection("users").doc(doc.id).update({
                    isBookRequestStatusActive:false
                })
            })
        })
    }

    sendNotification = ()=>{
       db.collection("users").where("email_id" , "==" , this.state.userId).get()
       .then((snapshot)=>{
           snapshot.forEach((doc)=>{
               var name = doc.data().first_name  + " " + doc.data().last_name

               db.collection("all_notifications").where("request_id" , "==" , this.state.requestId).get()
                        .then((snapshot)=>{

                snapshot.forEach((doc)=>{
                    var donorId = doc.data().donor_id;
                    var bookName = doc.data().book_name;

                   db.collection("all_notifications").add({
                       targeted_user_id:donorId,
                       message:name + " " + " Recieved The Book " + bookName,
                       notification_status: "Unread",
                       book_name : bookName
                   })
                 })

           })
           })
       })
       
       
    }
    
    

    render(){
        if(this.state.isBookRequestStatusActive === true){
            return(
                    <View style={{flex:1 , justifyContent:"center"}}>
                       <View style={{borderColor:"orange" , borderWidth:2 , justifyContent:"center" , alignItems:"center" , 
                                        padding:10
                                        }}>
                             <Text>
                                 Book Name
                             </Text>
                             <Text>
                                 {this.state.requestedBookName}
                             </Text>

                       </View>
                       <View  style={{borderColor:"orange" , borderWidth:2 , justifyContent:"center" , alignItems:"center" , padding:10}}>

                          <Text>
                              Book Status
                          </Text>
                          <Text>
                              {this.state.bookStatus}
                          </Text>
                       </View>

                       <TouchableOpacity style={{borderWidth:1 , marginTop:10 , alignSelf:"center" ,  borderColor:"orange" , backgroundColor:"orange" , width:300 , alignItems:"center"}}
                                         onPress={()=>{
                                             this.sendNotification();
                                             this.updateBookRequestStatus()
                                         }}>
                           <Text>
                               I Have Recieved The Book
                           </Text>

                       </TouchableOpacity>

                    </View>
            )
        }
        else{

        
        return(
            <View style={{flex:1}}>
                <MyHeader title={"Request Book!"} navigation = {this.props.navigation}/>
                <KeyboardAvoidingView style={styles.keyBoardStyle}>

                    <TextInput style={styles.formTextInput} placeholder={"Enter Name Of The Book"} 
                        onChangeText={(text)=>{

                        this.getBooksFromAPI(text)

                        }} 
                        value={this.state.bookName}

                        />

                       {
                           this.state.showFlatList?
                           (
                               <FlatList 
                               data={this.state.dataSource}
                               renderItem={this.renderItem}
                               keyExtractor={(item , index)=>{
                                   index.toString()

                               }}

                               style={{marginTop:10}}
                               enableEmptySections={true}

                               />
                           ):
                           (

                    <View style={{alignItems:"center"}}>
                    <TextInput style={[styles.formTextInput , {height:300} ]} placeholder={"Enter The Reason To Request The Book"} 
                        onChangeText={(text)=>{
                            this.setState({
                                reasonToRequest:text
                            })
                        }} value={this.state.reasonToRequest}
                        multiLine={true}
                        numberOfLines={8}
                        />

                        <TouchableOpacity style={styles.button} onPress={()=>{
                            this.addRequest()
                         }}>

                            <Text>
                                REQUEST
                            </Text>
                        </TouchableOpacity>
                        </View>

                        )
                    }

                </KeyboardAvoidingView>
            </View>
            
        )
    }
}
}
const styles = StyleSheet.create({
    keyBoardStyle : {
      flex:1,
      alignItems:'center',
      justifyContent:'center'
    },
    formTextInput:{
      width:"75%",
      height:35,
      alignSelf:'center',
      borderColor:'#ffab91',
      borderRadius:10,
      borderWidth:1,
      marginTop:20,
      padding:10,
    },
    button:{
      width:"75%",
      height:50,
      justifyContent:'center',
      alignItems:'center',
      borderRadius:10,
      backgroundColor:"#ff5722",
      shadowColor: "#000",
      shadowOffset: {
         width: 0,
         height: 8,
      },
      shadowOpacity: 0.44,
      shadowRadius: 10.32,
      elevation: 16,
      marginTop:20
      },
    }
  )