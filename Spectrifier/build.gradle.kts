plugins {
    kotlin("jvm") version "2.2.20"
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}
kotlin {
    jvmToolchain(17)
}

tasks.jar {

    enabled = true

    manifest {
        attributes["Main-Class"] = "SpectrifierKt"
    }

    // Simplified Fat JAR logic
    val runtimeClasspath = configurations.runtimeClasspath.get()
    from(runtimeClasspath.map { if (it.isDirectory) it else zipTree(it) })

    duplicatesStrategy = DuplicatesStrategy.EXCLUDE

    // Prevents issues with signed JARs in the fat JAR
    exclude("META-INF/*.SF", "META-INF/*.DSA", "META-INF/*.RSA")
}