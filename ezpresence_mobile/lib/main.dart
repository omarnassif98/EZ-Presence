import 'package:flutter/material.dart';
// import 'package:flutter/widgets.dart';
import 'styles.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:geolocator/geolocator.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'attendance.dart';

void main() {
  runApp(App());
}

class App extends StatefulWidget {
  @override
  _AppState createState() => _AppState();
}

class _AppState extends State<App> {
  final Future<FirebaseApp> _initialization = Firebase.initializeApp();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
        future: _initialization,
        builder: (context, snapshot) {
          // TODO: handle errors
          return MyApp();
        });
  }
}

class MyApp extends StatelessWidget {
  // This widget is the root of application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: AppColor.indigo,
        canvasColor: AppColor.white,
        primaryTextTheme: Theme.of(context).textTheme.apply(
              bodyColor: AppColor.white, //I changed this from black to white so EZ-Presence in the title would be white
              displayColor: AppColor.black,
            ),
        textTheme: Theme.of(context).textTheme.apply(
              bodyColor: AppColor.black,
              displayColor: AppColor.black,
            ),
      ),
      home: MyHomePage(title: 'EZPresence'),
      debugShowCheckedModeBanner: false,
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key? key, required this.title}) : super(key: key);

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  String email = '';
  String password = '';

  void login() async {
    await FirebaseAuth.instance
        .signInWithEmailAndPassword(email: email, password: password);
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => SecondRoute()),
    );
  }

  @override
  Widget build(BuildContext context) {
    //This is the first page of the mobile app
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.
    return Scaffold(
      resizeToAvoidBottomInset:
          false, //this fixes a simulator error saying the keyboard overflows the pixels, shouldn't have any other negative side effects
      appBar: AppBar(
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
        title: Text(widget.title),
      ),
      body: Center(
        // Center is a layout widget. It takes a single child and positions it
        // in the middle of the parent.
        child: Column(
          // Column is also a layout widget. It takes a list of children and
          // arranges them vertically. By default, it sizes itself to fit its
          // children horizontally, and tries to be as tall as its parent.
          //
          // Invoke "debug painting" (press "p" in the console, choose the
          // "Toggle Debug Paint" action from the Flutter Inspector in Android
          // Studio, or the "Toggle Debug Paint" command in Visual Studio Code)
          // to see the wireframe for each widget.
          //
          // Column has various properties to control how it sizes itself and
          // how it positions its children. Here we use mainAxisAlignment to
          // center the children vertically; the main axis here is the vertical
          // axis because Columns are vertical (the cross axis would be
          // horizontal).
          mainAxisAlignment: MainAxisAlignment.start,
          children: <Widget>[
            Text('EZPresence',
                textAlign: TextAlign.center,
                textScaleFactor: 4.0,
                style: TextStyle(height: 2.5)),
            Text('Student Application',
                textScaleFactor: 1.6,
                style: TextStyle(
                    height:
                        1.2 //This increases the amount of space between "EZPresence" and "Student Application"
                    )),
            SizedBox(
                height:
                    70), //This adds a space between the "Student Application" text and the "Username" textfield
            TextField(
              obscureText: false,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Username',
              ),
              onChanged: (String value) {
                email = value;
              },
              // style: TextStyle(
              //   height: 2.0,
              // )
            ),
            TextField(
              obscureText: true,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Password',
              ),
              onChanged: (String value) {
                password = value;
              },
            ),
            TextButton(
              style: ButtonStyle(
                foregroundColor: MaterialStateProperty.all<Color>(Colors.white),
                backgroundColor:
                    MaterialStateProperty.all<Color>(Colors.indigo),
              ),
              onPressed: login,
              child: Text('Login'),
            ),
            Text('Contact an administrator if you do not know your credentials',
                //textScaleFactor: 1.3,
                style: TextStyle(height: 6.0)),
          ],
        ),
      ),
    );
  }
}

class SecondRoute extends StatelessWidget {
  //The 2nd page of the mobile app
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Login Successful", style: TextStyle(color: Colors.green),),
      ),
      body: Center(
        // Center is a layout widget. It takes a single child and positions it
        // in the middle of the parent.
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: <Widget>[
            Text(
                'EZPresence',
                textAlign: TextAlign.center,
                textScaleFactor: 4.0,
                style: TextStyle(
                    height: 2.5
                )
            ),
            Text(
                'Student Application',
                textScaleFactor: 1.6,
                style: TextStyle(
                    height: 1.2 //This increases the amount of space between "EZPresence" and "Student Application"
                )
            ),
            Text(
              'Login Successful',
              textScaleFactor: 1.6,
              style: TextStyle(color: Colors.green),
            ),
            SizedBox(height: 70),
            Text(
              'Welcome!',
              textScaleFactor: 2.6,
            ),
            SizedBox(height: 70), //This box makes a little space between the "Welcome!" and the "Scan Code"
            SizedBox( //This box holds/is the button to "Scan Code"
              height: 100,
              width: 250,
              child: TextButton(
                style: ButtonStyle(
                  foregroundColor: MaterialStateProperty.all<Color>(Colors.white),
                  backgroundColor: MaterialStateProperty.all<Color>(Colors.indigo),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => QRRoute()),
                  );
                },
                child: Text('Scan Code', textScaleFactor: 3.0),
              ),
            )
          ],
        ),
      ),
    );
  }
}

class QRRoute extends StatefulWidget {
  @override
  _QRRouteState createState() => _QRRouteState();
}

class _QRRouteState extends State<QRRoute> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  // TODO: make these null safe
  Barcode? result;
  QRViewController? controller;

  //The QR page of the mobile app
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: <Widget>[
          Expanded(
            flex: 5,
            child: QRView(
              key: qrKey,
              onQRViewCreated: _onQRViewCreated,
            ),
          ),
          Expanded(
            flex: 1,
            child: Center(
              child: (result != null)
                  ? Text('Data: ${result?.code}')
                  : Text('Scan a code'),
            ),
          ),
          TextButton(
            style: ButtonStyle(
              foregroundColor: MaterialStateProperty.all<Color>(Colors.blue),
            ),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => SecondRoute()),
              );
            },
            child: Text('Go Back'),
          )
        ],
      ),
    );
  }

  void _onQRViewCreated(QRViewController controller) {
    this.controller = controller;
    controller.scannedDataStream.listen((scanData) {
      _getPosition().then((location) {
        List<String> splitData = scanData.code.split('|');
        String teacher_id = splitData[0];
        String class_id = splitData[1];
        String session_id = splitData[2];
        double latitude = location.latitude;
        double longitude = location.longitude;
        Attendance att = new Attendance(
            session_id, teacher_id, class_id, latitude, longitude);
        return FirebaseFunctions.instance
            .httpsCallable("validateLocation")(att.toJson());
      }).then((result) {
        print(result.toString());
      });
    });
  }

  Future<Position> _getPosition() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error("Location services are disabled.");
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error("Location permissions are denied.");
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return Future.error("Location permissions are permanantly denied.");
    }

    return await Geolocator.getCurrentPosition();
  }
}
