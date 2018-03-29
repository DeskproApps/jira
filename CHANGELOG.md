# Changelog

This project is following [Semantic Versioning](http://semver.org)

## [Unreleased][]

## [0.1.0-beta.8][] - 2018-03-28

### Fixed

 - oauth1 private and public keys readable only be owner

### Added

    - travis will atttach builds to Github PR's when enabled via s3 environment variables

### Changed

    - upgrade to @deskpro/apps-sdk-react version 0.2.13
    - upgrade to @deskpro/apps-dpat version 0.10.3

## [0.1.0-beta.7][] - 2018-02-12

 - default `process.env.NODE_ENV` to `production` when packaging the app for distribution with webpack
   
 - complete refactoring to a redux model   

## [0.1.0-beta.6][] - 2018-02-07

- allow agents to sign in using their own credentials

## [0.1.0-beta.5][] - 2018-02-05

 - ignore errors when syncing jira issue state with actual jira issues

## [0.1.0-beta.4][] - 2017-12-19

### Added

 - allow editing of jira issues

## [0.1.0-beta.3][] - 2017-12-13

### Fixed

 - remove hardcoded widths from the app container

### Changed  
 - upgrade to @deskpro/react-components version 1.2.4
 - upgrade to @deskpro/apps-sdk-react version 0.2.4

## [0.1.0-beta.2][] - 2017-11-25

### Changed

- upgrade @deskpro/apps-dpat to version 0.9.6
- use @deskpro/apps-installer version 0.4.2


## [0.1.0-beta.1][] - 2017-10-03

### Added

 - initial release
 
[Unreleased]: https://github.com/DeskproApps/jira/compare/v0.1.0-beta.8...HEAD
[0.1.0-beta.8]: https://github.com/DeskproApps/jira/compare/v0.1.0-beta.7...v0.1.0-beta.8
[0.1.0-beta.7]: https://github.com/DeskproApps/jira/compare/v0.1.0-beta.6...v0.1.0-beta.7
[0.1.0-beta.6]: https://github.com/DeskproApps/jira/compare/v0.1.0-beta.5...v0.1.0-beta.6
[0.1.0-beta.5]: https://github.com/DeskproApps/jira/compare/v0.1.0-beta.4...v0.1.0-beta.5
[0.1.0-beta.4]: https://github.com/DeskproApps/jira/compare/v0.1.0-beta.3...v0.1.0-beta.4
[0.1.0-beta.3]: https://github.com/DeskproApps/jira/compare/v0.1.0-beta.2...v0.1.0-beta.3
[0.1.0-beta.2]: https://github.com/DeskproApps/jira/compare/v0.1.0-beta.1...v0.1.0-beta.2
[0.1.0-beta.1]: https://github.com/DeskproApps/jira/compare/master...v0.1.0-beta.1
