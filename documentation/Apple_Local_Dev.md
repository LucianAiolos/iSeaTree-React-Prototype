# Building for iOS

## The High Points (for experienced iOS developers)

We use an individual account when  building for the App Store, not an organizational one. That means you have to change the development team in 
Xcode to use your own credentials, if you want to build locally. Please _do not_ commit that `.xcodeproj` change to the repository.

Cocoapods are updated at the repository level. Do not run any Cocoapods commands unless you're addressing a specific issue. See [https://guides.cocoapods.org/using/using-cocoapods.html](https://guides.cocoapods.org/using/using-cocoapods.html) for discussion of pros/cons of doing it this way. We have chosen to commit Cocoapods to make it easier for a volunteer who isn't an iOS developer to contribute.

Use the `iSeaTree` scheme for building to device or simulator, and uses a different bundle identifier that the production/TestFlight iSeaTree. The `iSeaTree-AppStore` scheme is for app store submissions.

## Just Enough Xcode

This section is for people who aren't usually iOS developers, and want to stick to JavaScript work, without tripping over the Apple details.

