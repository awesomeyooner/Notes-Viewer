# ROS 2 Notes

## Commands

> **NOTE** Make sure to `cd` into `src` when making the package

**Making a Package with CMake**
: `ros2 pkg create --build-type ament_cmake <package_name>`

**Making a Package with Python**
: `ros2 pkg create --build-type ament_python <package_name>`

**Running an Executable**
: `ros2 run <package name> <executable name>`

**Launching a Launch file**
: `ros2 launch <package_name> <launch_file_name>`
> **NOTE** You can ignore `<package_name>` if you are in the launch directory already

**Listening to Topics**
: `ros2 topic echo /<topic name>`

**Building**
: `colcon build --symlink-install`

**Sourcing**
: `source install/setup.bash`

## CMake Preparation

### Link Install folder

```cmake
# Add install globally to all targets
include_directories(
  ${CMAKE_CURRENT_SOURCE_DIR}/include
  $<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include/${PROJECT_NAME}>
  # any additional directories
)

# Add install to a specific target
target_include_directories(my_exec PUBLIC
  ${CMAKE_CURRENT_SOURCE_DIR}/include
  $<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include/${PROJECT_NAME}>
  # any additional directories
)
```

### To add an executable, use: 

```cmake
add_executable(<exec name> src/main.cpp)
ament_target_dependencies(<exec name> <dependencies...>)
```

### And add the executable with

```cmake
install(TARGETS
  <exec name>
  DESTINATION lib/${PROJECT_NAME})
```

### Install other folders

```cmake
install(DIRECTORY
  launch
  config
  DESTINATION share/${PROJECT_NAME}/
)
```

### A nice paradigm I like to use for adding dependencies is by using a for each:

```cmake
# Create list of dependencies
set(THIS_PACKAGE_INCLUDE_DEPENDS
  rclcpp
  std_msgs
  Qt5Widgets
  Qt5PrintSupport
)

# Find each dependency
find_package(ament_cmake REQUIRED)
foreach(Dependency IN ITEMS ${THIS_PACKAGE_INCLUDE_DEPENDS})
  find_package(${Dependency} REQUIRED)
endforeach()

# Link the dependencies
add_executable(<exec name> src/main.cpp)
ament_target_dependencies(<exec name> ${THIS_PACKAGE_INCLUDE_DEPENDS})
```

### Don't forget to add these dependencies to `package.xml`!

```xml
<buildtool_depend>ament_cmake</buildtool_depend>

<depend>rclcpp</depend>
<depend>std_msgs</depend>
<depend>sensor_msgs</depend>
<depend>geometry_msgs</depend>
<depend>pluginlib</depend>
<depend>rclcpp_lifecycle</depend>

<exec_depend>ros2launch</exec_depend>
<exec_depend>rviz2</exec_depend>
<exec_depend>xacro</exec_depend>

<test_depend>ament_cmake_gmock</test_depend>
<test_depend>ament_cmake_gtest</test_depend>
```

---

### CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.8)
project(my_package)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# Create list of dependencies
set(THIS_PACKAGE_INCLUDE_DEPENDS
  rclcpp
  std_msgs
  ament_cmake
)

# Find each dependency
find_package(ament_cmake REQUIRED)
foreach(Dependency IN ITEMS ${THIS_PACKAGE_INCLUDE_DEPENDS})
  find_package(${Dependency} REQUIRED)
endforeach()

# Link the dependencies
add_executable(my_exec src/main.cpp)
ament_target_dependencies(my_exec PUBLIC ${THIS_PACKAGE_INCLUDE_DEPENDS})

# Add Include Directory
target_include_directories(my_exec PUBLIC
  ${CMAKE_CURRENT_SOURCE_DIR}/include
  $<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include/${PROJECT_NAME}>
)

# Install Executable
install(TARGETS
  my_exec
  DESTINATION lib/${PROJECT_NAME})

# Install Extra Folders
install(DIRECTORY
  launch
  config
  DESTINATION share/${PROJECT_NAME}/
)

# Testing
if(BUILD_TESTING)
  # Add Dependencies
  find_package(ament_lint_auto REQUIRED)

  # the following line skips the linter which checks for copyrights
  # comment the line when a copyright and license is added to all source files
  set(ament_cmake_copyright_FOUND TRUE)
  # the following line skips cpplint (only works in a git repo)
  # comment the line when this package is in a git repo and when
  # a copyright and license is added to all source files
  set(ament_cmake_cpplint_FOUND TRUE)
  ament_lint_auto_find_test_dependencies()
endif()

ament_package()
```

### package.xml

```xml
<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>my_package</name>
  <version>0.0.0</version>
  <description>TODO: Package description</description>
  <maintainer email="awesomeyooner@gmail.com">dev</maintainer>
  <license>TODO: License declaration</license>

  <buildtool_depend>ament_cmake</buildtool_depend>

  <depend>rclcpp</depend>
  <depend>std_msgs</depend>
  <depend>sensor_msgs</depend>
  <depend>geometry_msgs</depend>
  <depend>pluginlib</depend>
  <depend>rclcpp_lifecycle</depend>

  <exec_depend>ros2launch</exec_depend>
  <exec_depend>rviz2</exec_depend>
  <exec_depend>xacro</exec_depend>

  <test_depend>ament_cmake_gmock</test_depend>
  <test_depend>ament_cmake_gtest</test_depend>

  <export>
    <build_type>ament_cmake</build_type>
  </export>
</package>
```

---

## Adding GTests

### Add `test_depend` to `package.xml`

```xml
<test_depend>ament_cmake_gmock</test_depend>
<test_depend>ament_cmake_gtest</test_depend>
```

### Add Testing Dependencies

```cmake
find_package(ament_cmake_gtest REQUIRED)
find_package(ament_cmake_gmock REQUIRED)
```

### Add Test Executable and Link Dependencies

```cmake
# Add Test Executable
ament_add_gtest(${PROJECT_NAME}_test test/test.cpp)
target_include_directories(${PROJECT_NAME}_test PUBLIC
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include>
)

# Add Dependencies to Executable
ament_target_dependencies(${PROJECT_NAME}_test ${THIS_PACKAGE_INCLUDE_DEPENDS})
```

### CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.8)
project(my_package)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# Create list of dependencies
set(THIS_PACKAGE_INCLUDE_DEPENDS
  rclcpp
  std_msgs
  ament_cmake
)

# Find each dependency
find_package(ament_cmake REQUIRED)
foreach(Dependency IN ITEMS ${THIS_PACKAGE_INCLUDE_DEPENDS})
  find_package(${Dependency} REQUIRED)
endforeach()

# Link the dependencies
add_executable(my_exec src/main.cpp)
ament_target_dependencies(my_exec PUBLIC ${THIS_PACKAGE_INCLUDE_DEPENDS})

# Add Include Directory
target_include_directories(my_exec PUBLIC
  ${CMAKE_CURRENT_SOURCE_DIR}/include
  $<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include/${PROJECT_NAME}>
)

# Install Executable
install(TARGETS
  my_exec
  DESTINATION lib/${PROJECT_NAME})

# Install Extra Folders
install(DIRECTORY
  launch
  config
  DESTINATION share/${PROJECT_NAME}/
)

# Testing
if(BUILD_TESTING)
  # Add Dependencies
  find_package(ament_cmake_gtest REQUIRED)
  find_package(ament_cmake_gmock REQUIRED)
  find_package(ament_lint_auto REQUIRED)

  # Add Test Executable
  ament_add_gtest(${PROJECT_NAME}_test test/test.cpp)
  target_include_directories(${PROJECT_NAME}_test PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
  )

  # Add Dependencies to Executable
  ament_target_dependencies(${PROJECT_NAME}_test ${THIS_PACKAGE_INCLUDE_DEPENDS})
  
  # target_link_libraries(${PROJECT_NAME}_test my_exec)
  # the following line skips the linter which checks for copyrights
  # comment the line when a copyright and license is added to all source files
  set(ament_cmake_copyright_FOUND TRUE)
  # the following line skips cpplint (only works in a git repo)
  # comment the line when this package is in a git repo and when
  # a copyright and license is added to all source files
  set(ament_cmake_cpplint_FOUND TRUE)
  ament_lint_auto_find_test_dependencies()
endif()

ament_package()
```

### package.xml

```xml
<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>my_package</name>
  <version>0.0.0</version>
  <description>TODO: Package description</description>
  <maintainer email="awesomeyooner@gmail.com">dev</maintainer>
  <license>TODO: License declaration</license>

  <buildtool_depend>ament_cmake</buildtool_depend>

  <depend>rclcpp</depend>
  <depend>std_msgs</depend>
  <depend>sensor_msgs</depend>
  <depend>geometry_msgs</depend>
  <depend>pluginlib</depend>
  <depend>rclcpp_lifecycle</depend>

  <exec_depend>ros2launch</exec_depend>
  <exec_depend>rviz2</exec_depend>
  <exec_depend>xacro</exec_depend>

  <test_depend>ament_cmake_gmock</test_depend>
  <test_depend>ament_cmake_gtest</test_depend>

  <export>
    <build_type>ament_cmake</build_type>
  </export>
</package>
```