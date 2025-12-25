plugins {
    kotlin("jvm") version "1.9.21"
}

group = "org.derp"
version = ""


repositories {
    mavenCentral()
}

dependencies {
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}
tasks {
    jar {
        manifest {
            attributes["Main-Class"] = "ImageSplitterKt"
        }

        duplicatesStrategy = DuplicatesStrategy.EXCLUDE

        from(
            configurations.runtimeClasspath.get().map {
                if (it.isDirectory) it else zipTree(it)
            }
        )
    }
}


tasks.test {
    useJUnitPlatform()
}
kotlin {
    jvmToolchain(17)
}